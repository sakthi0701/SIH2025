// src/lib/optimizer.ts

// --- UPDATED TYPE DEFINITIONS ---
import { Department, Course, Faculty, Room, Batch, Constraint } from '../context/DataContext';

export interface OptimizerInput {
  departments: Department[];
  rooms: Room[];
  constraints: Constraint[];
  targetSemester: number;
  academicSettings: {
    periods: { start: string, end: string }[];
    lunchStartTime: string;
    lunchEndTime: string;
  }
}

interface ScheduledClass {
  course: Course;
  faculty: Faculty;
  room: Room;
  batch: Batch;
  department: Department;
}

type Timetable = Record<string, Record<string, ScheduledClass[]>>;

// **NEW**: A detailed conflict object for the editor
export interface ConflictDetail {
  type: 'FACULTY_DOUBLE_BOOKED' | 'ROOM_DOUBLE_BOOKED' | 'BATCH_DOUBLE_BOOKED' | 'ROOM_CAPACITY' | 'FACULTY_UNASSIGNED' | 'FACULTY_OVERLOADED';
  day: string;
  slot: string;
  message: string;
  involved: string[]; // e.g., [faculty.id, course1.id, course2.id]
}

// **UPDATED**: OptimizationResult now uses the detailed conflict type
export interface OptimizationResult {
  id: number;
  name: string;
  timetable: Timetable;
  score: number;
  conflicts: ConflictDetail[]; // Changed from number to ConflictDetail[]
  created_at: string;
}

// --- CONSTANTS AND CONFIGURATION ---
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const POPULATION_SIZE = 100;
const MAX_GENERATIONS = 200;
const MUTATION_RATE = 0.02;
const TOURNAMENT_SIZE = 5;
const ELITISM_COUNT = 2;


// --- HELPER FUNCTIONS ---
const createClassSessions = (departments: Department[], targetSemester: number): { course: Course; batch: Batch, department: Department }[] => {
  const sessions: { course: Course; batch: Batch, department: Department }[] = [];
  for (const department of departments) {
    for (const batch of department.batches) {
      const regulation = department.regulations.find(r => r.id === batch.regulationId);
      if (!regulation) continue;
      const semester = regulation.semesters.find(s => s.semesterNumber === targetSemester);
      if (!semester) continue;
      for (const course of semester.courses) {
        for (let i = 0; i < course.weeklyHours; i++) {
          sessions.push({ course, batch, department });
        }
      }
    }
  }
  return sessions;
};

const getAllFaculty = (departments: Department[]): Faculty[] => {
    return departments.flatMap(dept => dept.faculty);
}

const yieldToEventLoop = () => new Promise(resolve => setTimeout(resolve, 0));


// --- CORE GENETIC ALGORITHM LOGIC ---
export const runOptimization = async (
  input: OptimizerInput,
  updateProgress: (progress: number) => void
): Promise<OptimizationResult[]> => {
  const { departments, rooms, constraints, academicSettings } = input;
  const TIME_SLOTS = academicSettings.periods.map(p => `${p.start}-${p.end}`);
  const LUNCH_SLOT = `${academicSettings.lunchStartTime}-${academicSettings.lunchEndTime}`;
  const SCHEDULABLE_SLOTS = TIME_SLOTS.filter(slot => slot !== LUNCH_SLOT);

  const classSessions = createClassSessions(departments, input.targetSemester);
  const allFaculty = getAllFaculty(departments);
  const enabledSoftConstraints = constraints.filter(c => c.type === 'soft' && c.enabled);

  if (classSessions.length === 0 || allFaculty.length === 0 || rooms.length === 0) {
      throw new Error("Insufficient data for optimization.");
  }

  const OPTIMIZATION_RUNS = 3;
  let allResults: OptimizationResult[] = [];

  for (let run = 0; run < OPTIMIZATION_RUNS; run++) {
    let population = initializePopulation(classSessions, allFaculty, rooms, POPULATION_SIZE, SCHEDULABLE_SLOTS);

    for (let generation = 0; generation < MAX_GENERATIONS; generation++) {
      const fitnessScores = population.map(individual => calculateFitness(individual, input));
      let newPopulation = [];
      const sortedPopulation = population
          .map((ind, i) => ({ individual: ind, score: fitnessScores[i] }))
          .sort((a, b) => b.score - a.score);
      for (let i = 0; i < ELITISM_COUNT; i++) { newPopulation.push(sortedPopulation[i].individual); }
      for (let i = 0; i < POPULATION_SIZE - ELITISM_COUNT; i++) {
        const parent1 = tournamentSelection(population, fitnessScores);
        const parent2 = tournamentSelection(population, fitnessScores);
        let child = crossover(parent1, parent2);
        child = mutate(child, allFaculty, rooms, SCHEDULABLE_SLOTS);
        newPopulation.push(child);
      }
      population = newPopulation;

      // Update progress based on the current run and generation
      const totalProgress = (run / OPTIMIZATION_RUNS) * 100 + (generation / MAX_GENERATIONS) * (100 / OPTIMIZATION_RUNS);
      updateProgress(5 + totalProgress * 0.9);
      await yieldToEventLoop();
    }

    const finalFitnessScores = population.map(individual => calculateFitness(individual, input));
    const bestIndividual = population[finalFitnessScores.indexOf(Math.max(...finalFitnessScores))];
    const bestTimetable = individualToTimetable(bestIndividual, TIME_SLOTS);
    const bestScore = calculateScore(bestTimetable, enabledSoftConstraints, input, SCHEDULABLE_SLOTS);
    const bestConflicts = getHardConflicts(bestIndividual, input);

    allResults.push({
      id: run + 1,
      name: `Solution ${run + 1}`,
      timetable: bestTimetable,
      score: bestScore,
      conflicts: bestConflicts,
      created_at: new Date().toISOString(),
    });
  }

  updateProgress(100);

  // Sort all results by score (descending) and return the top 3
  return allResults.sort((a, b) => b.score - a.score).slice(0, 3);
};


// --- GA OPERATORS ---
const initializePopulation = (sessions: any[], allFaculty: Faculty[], rooms: Room[], size: number, schedulableSlots: string[]): any[][] => {
  let population = [];
  for (let i = 0; i < size; i++) {
    let individual = [];
    for (const session of sessions) {
      const suitableFaculty = allFaculty.filter(f => f.assignedCourses.includes(session.course.id));
      const randomFaculty = suitableFaculty.length > 0
        ? suitableFaculty[Math.floor(Math.random() * suitableFaculty.length)]
        : null;
      const randomDay = DAYS[Math.floor(Math.random() * DAYS.length)];
      const randomSlot = schedulableSlots[Math.floor(Math.random() * schedulableSlots.length)];
      const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];
      individual.push({ ...session, day: randomDay, slot: randomSlot, faculty: randomFaculty, room: randomRoom });
    }
    population.push(individual);
  }
  return population;
};

const calculateFitness = (individual: any[], inputData: OptimizerInput): number => {
  let fitness = 1000; // Start with a higher base fitness to allow for more nuanced penalties.

  // 1. INCREASED PENALTY FOR HARD CONFLICTS
  // This makes any double-booking or capacity issue highly undesirable for the algorithm.
  const hardConflicts = getHardConflicts(individual, inputData);
  fitness -= hardConflicts.length * 50; // Adjusted from 100 to 50

  const TIME_SLOTS = inputData.academicSettings.periods.map(p => `${p.start}-${p.end}`);
  const timetable = individualToTimetable(individual, TIME_SLOTS);
  const enabledSoftConstraints = inputData.constraints.filter(c => c.type === 'soft' && c.enabled);

  // Add the score from our improved scoring function
  const score = calculateScore(timetable, enabledSoftConstraints, inputData, TIME_SLOTS);
  fitness += score; // This score will be negative, representing penalties

  return Math.max(0, fitness);
};

const tournamentSelection = (population: any[][], fitnessScores: number[]) => {
  let best = null;
  let bestFitness = -1;
  for (let i = 0; i < TOURNAMENT_SIZE; i++) {
    const randomIndex = Math.floor(Math.random() * population.length);
    if (fitnessScores[randomIndex] > bestFitness) {
      bestFitness = fitnessScores[randomIndex];
      best = population[randomIndex];
    }
  }
  return best!;
};

const crossover = (parent1: any[], parent2: any[]): any[] => {
    return parent1.map((gene, index) => Math.random() < 0.5 ? gene : parent2[index]);
};

const mutate = (individual: any[], allFaculty: Faculty[], rooms: Room[], schedulableSlots: string[]): any[] => {
    return individual.map(session => {
        if (Math.random() < MUTATION_RATE) {
            const suitableFaculty = allFaculty.filter(f => f.assignedCourses.includes(session.course.id));
            const newFaculty = suitableFaculty.length > 0 ? suitableFaculty[Math.floor(Math.random() * suitableFaculty.length)] : null;
            return {
                ...session,
                day: DAYS[Math.floor(Math.random() * DAYS.length)],
                slot: schedulableSlots[Math.floor(Math.random() * schedulableSlots.length)],
                room: rooms[Math.floor(Math.random() * rooms.length)],
                faculty: newFaculty,
            };
        }
        return session;
    });
};


// --- CONFLICT & SCORING LOGIC ---
const getHardConflicts = (individual: any[], inputData: OptimizerInput): ConflictDetail[] => {
    const conflicts: ConflictDetail[] = [];
    const slotMap: Map<string, any[]> = new Map();

    for (const session of individual) {
        if (!session.day || !session.slot) continue;
        const key = `${session.day}-${session.slot}`;
        if (!slotMap.has(key)) slotMap.set(key, []);
        slotMap.get(key)!.push(session);
    }

    for (const [key, classesInSlot] of slotMap.entries()) {
        if (classesInSlot.length <= 1) continue;
        const [day, slot] = key.split('-');

        const facultyInSlot = new Map<string, any[]>();
        const roomsInSlot = new Map<string, any[]>();
        const batchesInSlot = new Map<string, any[]>();

        for (const c of classesInSlot) {
            if (c.faculty) {
                if (!facultyInSlot.has(c.faculty.id)) facultyInSlot.set(c.faculty.id, []);
                facultyInSlot.get(c.faculty.id)!.push(c);
            }
            if (c.room) {
                if (!roomsInSlot.has(c.room.id)) roomsInSlot.set(c.room.id, []);
                roomsInSlot.get(c.room.id)!.push(c);
            }
            if (c.batch) {
                if (!batchesInSlot.has(c.batch.id)) batchesInSlot.set(c.batch.id, []);
                batchesInSlot.get(c.batch.id)!.push(c);
            }
        }

        facultyInSlot.forEach((classes) => {
            if (classes.length > 1) conflicts.push({ type: 'FACULTY_DOUBLE_BOOKED', day, slot, message: `${classes[0].faculty.name} is booked for ${classes.length} classes.`, involved: classes.map(c => c.course.id) });
        });
        roomsInSlot.forEach((classes) => {
            if (classes.length > 1) conflicts.push({ type: 'ROOM_DOUBLE_BOOKED', day, slot, message: `Room ${classes[0].room.name} is booked for ${classes.length} classes.`, involved: classes.map(c => c.course.id) });
        });
        batchesInSlot.forEach((classes) => {
            if (classes.length > 1) conflicts.push({ type: 'BATCH_DOUBLE_BOOKED', day, slot, message: `Batch ${classes[0].batch.name} has ${classes.length} classes scheduled.`, involved: classes.map(c => c.course.id) });
        });
    }

    for (const c of individual) {
        if (!c.faculty) {
            conflicts.push({ type: 'FACULTY_UNASSIGNED', day: c.day, slot: c.slot, message: `Course ${c.course.name} has no faculty.`, involved: [c.course.id] });
        }
        if (c.room && c.batch && c.room.capacity < c.batch.studentCount) {
            conflicts.push({ type: 'ROOM_CAPACITY', day: c.day, slot: c.slot, message: `Room ${c.room.name} (Cap: ${c.room.capacity}) too small for ${c.batch.name} (${c.batch.studentCount}).`, involved: [c.room.id, c.batch.id] });
        }
    }

    return conflicts;
}

const calculateScore = (timetable: Timetable, softConstraints: Constraint[], inputData: OptimizerInput, schedulableSlots: string[]): number => {
    let score = 0;
    const GAP_PENALTY = 10; // 2. INCREASED GAP PENALTY (from 5 to 10)
    const FIRST_HOUR_PENALTY = 5; // 3. NEW: PENALTY FOR STARTING LATE

    for (const department of inputData.departments) {
        for (const batch of department.batches) {
            for (const day of DAYS) {
                const classIndices = schedulableSlots
                    .map((slot, index) => timetable[day]?.[slot]?.some(c => c.batch.id === batch.id) ? index : -1)
                    .filter(index => index !== -1)
                    .sort((a, b) => a - b);

                if (classIndices.length > 0) {
                    // Penalize gaps at the beginning of the day to push classes earlier
                    const firstClassIndex = classIndices[0];
                    score -= firstClassIndex * FIRST_HOUR_PENALTY;

                    // Penalize gaps between classes more heavily
                    if (classIndices.length > 1) {
                        for (let i = 0; i < classIndices.length - 1; i++) {
                            const gap = classIndices[i+1] - classIndices[i] - 1;
                            if (gap > 0) {
                                score -= gap * GAP_PENALTY;
                            }
                        }
                    }
                }
            }
        }
    }
    // This is where other soft constraints (like teacher preferences) would be added in the future.

    return score; // The final score is a negative value representing total penalties.
};

const individualToTimetable = (individual: any[], timeSlots: string[]): Timetable => {
    const timetable: Timetable = Object.fromEntries(DAYS.map(day => [day, Object.fromEntries(timeSlots.map(slot => [slot, []]))]));
    for (const assignment of individual) {
        if(assignment.day && assignment.slot) {
            if(!timetable[assignment.day]) timetable[assignment.day] = {};
            if(!timetable[assignment.day][assignment.slot]) timetable[assignment.day][assignment.slot] = []
            timetable[assignment.day][assignment.slot].push(assignment);
        }
    }
    return timetable;
}