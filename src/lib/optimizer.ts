// src/lib/optimizer.ts

// --- UPDATED TYPE DEFINITIONS ---
import { Department, Course, Faculty, Room, Batch, Constraint } from '../context/DataContext';

export interface OptimizerInput {
  departments: Department[];
  rooms: Room[];
  constraints: Constraint[];
  targetSemester: number;
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
}

// --- CONSTANTS AND CONFIGURATION ---
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = ['9:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'];
const LUNCH_SLOT = '12:00-13:00';
const SCHEDULABLE_SLOTS = TIME_SLOTS.filter(slot => slot !== LUNCH_SLOT);
const POPULATION_SIZE = 50;
const MAX_GENERATIONS = 100;
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
  input.targetSemester = 3;
  const { departments, rooms, constraints } = input;
  updateProgress(5);
  await yieldToEventLoop();

  const classSessions = createClassSessions(departments, input.targetSemester);
  const allFaculty = getAllFaculty(departments);
  const enabledSoftConstraints = constraints.filter(c => c.type === 'soft' && c.enabled);

  if (classSessions.length === 0 || allFaculty.length === 0 || rooms.length === 0) {
      throw new Error("Insufficient data for optimization.");
  }

  let population = initializePopulation(classSessions, allFaculty, rooms, POPULATION_SIZE);

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
      child = mutate(child, allFaculty, rooms);
      newPopulation.push(child);
    }
    population = newPopulation;
    updateProgress(5 + (generation / MAX_GENERATIONS) * 90);
    await yieldToEventLoop();
  }

  const finalFitnessScores = population.map(individual => calculateFitness(individual, input));
  const bestIndividual = population[finalFitnessScores.indexOf(Math.max(...finalFitnessScores))];
  const bestTimetable = individualToTimetable(bestIndividual);
  const bestScore = calculateScore(bestTimetable, enabledSoftConstraints, input);
  const bestConflicts = getHardConflicts(bestIndividual, input); // Using the new detailed function

  updateProgress(100);

  return [{
    id: 1,
    name: "Generated Schedule",
    timetable: bestTimetable,
    score: bestScore,
    conflicts: bestConflicts,
  }];
};


// --- GA OPERATORS ---
const initializePopulation = (sessions: any[], allFaculty: Faculty[], rooms: Room[], size: number): any[][] => {
  let population = [];
  for (let i = 0; i < size; i++) {
    let individual = [];
    for (const session of sessions) {
      const suitableFaculty = allFaculty.filter(f => f.assignedCourses.includes(session.course.id));
      const randomFaculty = suitableFaculty.length > 0 
        ? suitableFaculty[Math.floor(Math.random() * suitableFaculty.length)] 
        : null;
      const randomDay = DAYS[Math.floor(Math.random() * DAYS.length)];
      const randomSlot = SCHEDULABLE_SLOTS[Math.floor(Math.random() * SCHEDULABLE_SLOTS.length)];
      const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];
      individual.push({ ...session, day: randomDay, slot: randomSlot, faculty: randomFaculty, room: randomRoom });
    }
    population.push(individual);
  }
  return population;
};

const calculateFitness = (individual: any[], inputData: OptimizerInput) => {
  let fitness = 100;
  // **UPDATED**: Use the length of the detailed conflict array for penalty
  fitness -= getHardConflicts(individual, inputData).length * 10;
  const timetable = individualToTimetable(individual);
  const score = calculateScore(timetable, [], inputData);
  fitness += (score - 100);
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

const mutate = (individual: any[], allFaculty: Faculty[], rooms: Room[]): any[] => {
    return individual.map(session => {
        if (Math.random() < MUTATION_RATE) {
            const suitableFaculty = allFaculty.filter(f => f.assignedCourses.includes(session.course.id));
            const newFaculty = suitableFaculty.length > 0 ? suitableFaculty[Math.floor(Math.random() * suitableFaculty.length)] : null;
            return {
                ...session,
                day: DAYS[Math.floor(Math.random() * DAYS.length)],
                slot: SCHEDULABLE_SLOTS[Math.floor(Math.random() * SCHEDULABLE_SLOTS.length)],
                room: rooms[Math.floor(Math.random() * rooms.length)],
                faculty: newFaculty,
            };
        }
        return session;
    });
};


// --- CONFLICT & SCORING LOGIC ---
// **RENAMED & REWRITTEN**: from countHardConflicts to getHardConflicts to return details
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

const calculateScore = (timetable: Timetable, softConstraints: Constraint[], inputData: OptimizerInput): number => {
    let score = 0;
    const GAP_PENALTY = 5;
    for (const department of inputData.departments) {
        for (const batch of department.batches) {
            for (const day of DAYS) {
                const classIndices = SCHEDULABLE_SLOTS
                    .map((slot, index) => timetable[day][slot].some(c => c.batch.id === batch.id) ? index : -1)
                    .filter(index => index !== -1)
                    .sort((a, b) => a - b);

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
    return 100 + score;
};

const individualToTimetable = (individual: any[]): Timetable => {
    const timetable: Timetable = Object.fromEntries(DAYS.map(day => [day, Object.fromEntries(TIME_SLOTS.map(slot => [slot, []]))]));
    for (const assignment of individual) {
        if(assignment.day && assignment.slot) {
            timetable[assignment.day][assignment.slot].push(assignment);
        }
    }
    return timetable;
}