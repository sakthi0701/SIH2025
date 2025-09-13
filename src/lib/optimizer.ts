// src/lib/optimizer.ts

// --- TYPE DEFINITIONS ---
// These types match the ones in your DataContext for consistency.

interface Course {
  id: string;
  name: string;
  code: string;
  department: string;
  weeklyHours: number;
  // ... other course properties
}

interface Faculty {
  id: string;
  name: string;
  maxLoad: number;
  preferences: string[]; // e.g., ['Morning slots']
  // ... other faculty properties
}

interface Room {
  id: string;
  name: string;
  capacity: number;
  // ... other room properties
}

interface Batch {
  id: string;
  name: string;
  studentCount: number;
  department: string;
  // ... other batch properties
}

interface Constraint {
  id: string;
  name: string;
  type: 'hard' | 'soft';
  enabled: boolean;
  priority: number;
  // ... other constraint properties
}

// Represents the input data for the optimizer
export interface OptimizerInput {
  courses: Course[];
  faculty: Faculty[];
  rooms: Room[];
  batches: Batch[];
  constraints: Constraint[];
}

// Represents a single scheduled class in a time slot
interface ScheduledClass {
  course: Course;
  faculty: Faculty;
  room: Room;
  batch: Batch;
}

// The main timetable structure: Day -> Time Slot -> Scheduled Class
type Timetable = Record<string, Record<string, ScheduledClass[]>>;

// A single generated solution with its score and details
export interface OptimizationResult {
  id: number;
  name: string;
  timetable: Timetable;
  score: number;
  conflicts: number; // Should be 0 if successful
  utilization: number;
  facultyBalance: number;
  studentGaps: number;
}

// --- CONSTANTS AND CONFIGURATION ---

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = ['9:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'];
const LUNCH_SLOT = '12:00-13:00';

// --- HELPER FUNCTIONS ---

/**
 * Creates a list of individual class sessions to be scheduled.
 * For example, a course with weeklyHours = 3 will create 3 sessions.
 */
const createClassSessions = (courses: Course[], batches: Batch[]): { course: Course; batch: Batch }[] => {
  const sessions: { course: Course; batch: Batch }[] = [];
  courses.forEach(course => {
    // Find a matching batch (simplified logic: matches by department)
    const courseBatch = batches.find(b => b.department === course.department);
    if (courseBatch) {
      for (let i = 0; i < course.weeklyHours; i++) {
        sessions.push({ course, batch: courseBatch });
      }
    }
  });
  return sessions;
};

/**
 * A utility to pause execution, allowing the UI to update.
 */
const yieldToEventLoop = () => new Promise(resolve => setTimeout(resolve, 0));


// --- CORE OPTIMIZER LOGIC ---

export const runOptimization = async (
  input: OptimizerInput,
  updateProgress: (progress: number) => void
): Promise<OptimizationResult[]> => {
  
  const { courses, faculty, rooms, batches, constraints } = input;
  let solutions: OptimizationResult[] = [];

  updateProgress(5);
  await yieldToEventLoop();

  // 1. Prepare data for optimization
  const classSessions = createClassSessions(courses, batches);
  const enabledHardConstraints = constraints.filter(c => c.type === 'hard' && c.enabled);
  const enabledSoftConstraints = constraints.filter(c => c.type === 'soft' && c.enabled);

  // 2. Backtracking solver
  const solve = async (sessionsToSchedule: typeof classSessions, currentTimetable: Timetable, assignedFacultyLoad: Record<string, number>): Promise<Timetable | null> => {
    // Base case: If there are no more sessions to schedule, we found a solution.
    if (sessionsToSchedule.length === 0) {
      return currentTimetable;
    }

    const [currentSession, ...remainingSessions] = sessionsToSchedule;
    
    // Iterate through all possible assignments for the current session
    for (const day of DAYS) {
      for (const slot of TIME_SLOTS) {
        if (slot === LUNCH_SLOT) continue; // Skip lunch break

        for (const f of faculty) {
          for (const r of rooms) {
            
            const newAssignment: ScheduledClass = {
              course: currentSession.course,
              batch: currentSession.batch,
              faculty: f,
              room: r,
            };

            // --- HARD CONSTRAINT CHECKING ---
            let isConsistent = true;
            for (const constraint of enabledHardConstraints) {
              if (!checkConsistency(constraint.name, newAssignment, day, slot, currentTimetable, assignedFacultyLoad)) {
                isConsistent = false;
                break;
              }
            }

            if (isConsistent) {
              // If consistent, apply the assignment and recurse
              currentTimetable[day][slot].push(newAssignment);
              assignedFacultyLoad[f.id] = (assignedFacultyLoad[f.id] || 0) + 1;

              const result = await solve(remainingSessions, currentTimetable, assignedFacultyLoad);
              if (result) {
                return result; // Solution found
              }

              // If recursion fails, backtrack
              currentTimetable[day][slot].pop();
              assignedFacultyLoad[f.id] -= 1;
            }
          }
        }
      }
    }

    return null; // No valid assignment found for this session
  };
  
  // 3. Generate a solution
  updateProgress(20);
  await yieldToEventLoop();

  const initialTimetable = Object.fromEntries(DAYS.map(day => [day, Object.fromEntries(TIME_SLOTS.map(slot => [slot, []]))]));
  const initialFacultyLoad = Object.fromEntries(faculty.map(f => [f.id, 0]));
  
  const foundTimetable = await solve(classSessions, initialTimetable, initialFacultyLoad);
  
  updateProgress(80);
  await yieldToEventLoop();
  
  // 4. Score and format the solution
  if (foundTimetable) {
    const score = calculateScore(foundTimetable, enabledSoftConstraints, input);
    solutions.push({
      id: 1,
      name: "Generated Schedule",
      timetable: foundTimetable,
      score: score,
      conflicts: 0, // Hard constraints passed
      // Calculate other metrics
      utilization: 0, 
      facultyBalance: 0,
      studentGaps: 0,
    });
  } else {
      console.error("Could not find a valid solution that satisfies all hard constraints.");
      // Return empty or an error state
  }

  updateProgress(100);
  return solutions;
};


// --- CONSTRAINT CHECKING LOGIC ---

const checkConsistency = (
  constraintName: string,
  assignment: ScheduledClass,
  day: string,
  slot: string,
  timetable: Timetable,
  facultyLoad: Record<string, number>
): boolean => {
  const { course, faculty, room, batch } = assignment;
  const classesInSlot = timetable[day][slot];

  switch (constraintName) {
    case 'No Faculty Double Booking':
      return !classesInSlot.some(c => c.faculty.id === faculty.id);

    case 'No Room Double Booking':
      return !classesInSlot.some(c => c.room.id === room.id);
      
    case 'No Batch Double Booking':
      return !classesInSlot.some(c => c.batch.id === batch.id);

    case 'Room Capacity Check':
      return room.capacity >= batch.studentCount;
      
    case 'Faculty Workload': // Assumed hard constraint
      return (facultyLoad[faculty.id] || 0) < faculty.maxLoad;

    default:
      return true; // Unknown constraints are ignored
  }
};


// --- SCORING LOGIC ---

const calculateScore = (
  timetable: Timetable,
  softConstraints: Constraint[],
  inputData: OptimizerInput
): number => {
  let totalPenalty = 0;

  for (const constraint of softConstraints) {
      if (!constraint.enabled) continue;
      
      let penalty = 0;
      const weight = constraint.priority / 10.0;

      switch(constraint.name) {
          case 'Faculty Preferred Hours':
              // Simplified: 'Morning' is before lunch
              for(const day of DAYS) {
                  for(const slot of TIME_SLOTS) {
                      timetable[day][slot].forEach(c => {
                          const isMorning = TIME_SLOTS.indexOf(slot) < TIME_SLOTS.indexOf(LUNCH_SLOT);
                          if (
                              (c.faculty.preferences.includes('Morning slots') && !isMorning) ||
                              (c.faculty.preferences.includes('Afternoon slots') && isMorning)
                          ) {
                              penalty += 1;
                          }
                      });
                  }
              }
              break;
          
          case 'Minimize Student Gaps':
              // This is computationally expensive. Simplified version:
              let gaps = 0;
              for (const batch of inputData.batches) {
                  for (const day of DAYS) {
                      const batchSlots = TIME_SLOTS
                          .map((slot, index) => timetable[day][slot].some(c => c.batch.id === batch.id) ? index : -1)
                          .filter(index => index !== -1);
                      
                      for (let i = 0; i < batchSlots.length - 1; i++) {
                          const gap = batchSlots[i+1] - batchSlots[i] - 1;
                          if (gap > 0) {
                              gaps += gap;
                          }
                      }
                  }
              }
              penalty = gaps;
              break;
      }
      totalPenalty += penalty * weight;
  }
  
  // Score starts at 100 and decreases with penalties
  return Math.max(0, 100 - totalPenalty);
};
