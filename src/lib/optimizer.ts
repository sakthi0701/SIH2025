// src/lib/optimizer.ts

import { Department, Course, Faculty, Room, Batch, Constraint } from '../context/DataContext';

// Enhanced types with better conflict tracking
export interface ConflictDetail {
  type: 'FACULTY_DOUBLE_BOOKED' | 'ROOM_DOUBLE_BOOKED' | 'BATCH_DOUBLE_BOOKED' |
        'ROOM_CAPACITY' | 'FACULTY_UNASSIGNED' | 'FACULTY_OVERLOADED' |
        'CONTINUOUS_CLASSES' | 'POOR_CLUSTERING';
  day: string;
  slot: string;
  message: string;
  involved: string[];
  severity: 'critical' | 'high' | 'medium' | 'low'; // New severity levels
}

export interface OptimizationResult {
  id: string;
  name: string;
  timetable: Timetable;
  score: number;
  conflicts: ConflictDetail[];
  created_at: string;
  quality_metrics: QualityMetrics; // New quality tracking
}

interface QualityMetrics {
  clustering_score: number;    // How well classes are grouped
  distribution_score: number;  // How evenly distributed across days
  conflict_count: number;      // Total conflicts
  utilization_rate: number;    // Resource utilization
}

// Enhanced configuration
const CONFIG = {
  POPULATION_SIZE: 150,        // Increased for better diversity
  MAX_GENERATIONS: 300,        // More generations for better solutions
  MUTATION_RATE: 0.05,         // Slightly higher mutation
  TOURNAMENT_SIZE: 7,          // Larger tournament for better selection
  ELITISM_COUNT: 5,            // Keep more good solutions
  
  // Penalty weights (higher = more important)
  PENALTIES: {
    HARD_CONFLICT: 1000,       // Critical - must be zero
    CONTINUOUS_CLASSES: 50,    // High penalty for back-to-back classes
    POOR_CLUSTERING: 30,       // Penalty for scattered classes
    GAP_PENALTY: 20,           // Penalty for gaps between classes
    LATE_START_PENALTY: 10,    // Prefer earlier start times
    UNEVEN_DISTRIBUTION: 15,   // Prefer even distribution across days
  },
  
  // Clustering preferences
  MAX_CONTINUOUS_CLASSES: 2,   // Max classes in a row
  MIN_BREAK_BETWEEN: 1,        // Minimum slots between class blocks
  PREFERRED_CLUSTER_SIZE: 3,   // Ideal number of classes in a cluster
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Enhanced initialization with clustering in mind
const initializePopulationClustered = (
  sessions: any[], 
  allFaculty: Faculty[], 
  rooms: Room[], 
  size: number, 
  schedulableSlots: string[]
): any[][] => {
  const population = [];
  
  for (let i = 0; i < size; i++) {
    const individual = [];
    const sessionsByBatch = groupSessionsByBatch(sessions);
    
    for (const [batchId, batchSessions] of sessionsByBatch.entries()) {
      // Try to create clusters for this batch
      const clusters = createClusters(batchSessions, schedulableSlots.length);
      
      for (const cluster of clusters) {
        const placedCluster = placeClusterInSchedule(
          cluster, 
          allFaculty, 
          rooms, 
          schedulableSlots,
          individual
        );
        individual.push(...placedCluster);
      }
    }
    
    population.push(individual);
  }
  
  return population;
};

// Group sessions by batch for better organization
const groupSessionsByBatch = (sessions: any[]) => {
  const grouped = new Map<string, any[]>();
  
  for (const session of sessions) {
    if (!grouped.has(session.batch.id)) {
      grouped.set(session.batch.id, []);
    }
    grouped.get(session.batch.id)!.push(session);
  }
  
  return grouped;
};

// Create clusters of classes to be scheduled together
const createClusters = (sessions: any[], maxSlotsPerDay: number) => {
  const clusters = [];
  const sessionsPerCluster = Math.min(CONFIG.PREFERRED_CLUSTER_SIZE, maxSlotsPerDay - 1);
  
  // Shuffle sessions to avoid always grouping the same courses
  const shuffled = [...sessions].sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < shuffled.length; i += sessionsPerCluster) {
    clusters.push(shuffled.slice(i, i + sessionsPerCluster));
  }
  
  return clusters;
};

// Place a cluster in the schedule with proper spacing
const placeClusterInSchedule = (
  cluster: any[],
  allFaculty: Faculty[],
  rooms: Room[],
  schedulableSlots: string[],
  existingIndividual: any[]
) => {
  const placedCluster = [];
  
  // Find a good starting position for the cluster
  const day = DAYS[Math.floor(Math.random() * DAYS.length)];
  const maxStartSlot = schedulableSlots.length - cluster.length - CONFIG.MIN_BREAK_BETWEEN;
  const startSlot = Math.floor(Math.random() * Math.max(1, maxStartSlot));
  
  for (let i = 0; i < cluster.length; i++) {
    const session = cluster[i];
    const slotIndex = startSlot + i;
    
    // Skip if we would go beyond available slots
    if (slotIndex >= schedulableSlots.length) break;
    
    // Add break between clusters (except for first class in cluster)
    const actualSlotIndex = i === 0 ? slotIndex : slotIndex + CONFIG.MIN_BREAK_BETWEEN;
    
    if (actualSlotIndex >= schedulableSlots.length) break;
    
    const slot = schedulableSlots[actualSlotIndex];
    
    // Assign faculty and room
    const suitableFaculty = allFaculty.filter(f => 
      f.assignedCourses.includes(session.course.id)
    );
    const faculty = suitableFaculty.length > 0 
      ? suitableFaculty[Math.floor(Math.random() * suitableFaculty.length)]
      : null;
    
    const room = rooms[Math.floor(Math.random() * rooms.length)];
    
    placedCluster.push({
      ...session,
      day,
      slot,
      faculty,
      room
    });
  }
  
  return placedCluster;
};

// Enhanced fitness calculation with clustering awareness
const calculateEnhancedFitness = (individual: any[], inputData: OptimizerInput): number => {
  let fitness = 2000; // Higher base fitness
  
  // 1. Critical hard conflicts (must be zero for viable solution)
  const hardConflicts = getHardConflicts(individual, inputData);
  fitness -= hardConflicts.length * CONFIG.PENALTIES.HARD_CONFLICT;
  
  // 2. Continuous classes penalty (avoid back-to-back exhaustion)
  const continuousPenalty = calculateContinuousClassesPenalty(individual);
  fitness -= continuousPenalty * CONFIG.PENALTIES.CONTINUOUS_CLASSES;
  
  // 3. Clustering quality (reward well-grouped classes)
  const clusteringPenalty = calculateClusteringPenalty(individual);
  fitness -= clusteringPenalty * CONFIG.PENALTIES.POOR_CLUSTERING;
  
  // 4. Distribution quality (prefer even spread across days)
  const distributionPenalty = calculateDistributionPenalty(individual);
  fitness -= distributionPenalty * CONFIG.PENALTIES.UNEVEN_DISTRIBUTION;
  
  // 5. Gap penalties (minimize free periods between classes)
  const gapPenalty = calculateGapPenalty(individual, inputData);
  fitness -= gapPenalty * CONFIG.PENALTIES.GAP_PENALTY;
  
  return Math.max(0, fitness);
};

// Calculate penalty for too many continuous classes
const calculateContinuousClassesPenalty = (individual: any[]): number => {
  let penalty = 0;
  const batchSchedules = new Map<string, Map<string, number[]>>();
  
  // Group by batch and day
  for (const session of individual) {
    if (!session.day || !session.slot || !session.batch) continue;
    
    if (!batchSchedules.has(session.batch.id)) {
      batchSchedules.set(session.batch.id, new Map());
    }
    
    const batchDays = batchSchedules.get(session.batch.id)!;
    if (!batchDays.has(session.day)) {
      batchDays.set(session.day, []);
    }
    
    // Convert slot to index for sorting
    const slotIndex = parseInt(session.slot.split('-')[0].replace(':', ''));
    batchDays.get(session.day)!.push(slotIndex);
  }
  
  // Check for continuous classes
  for (const [batchId, batchDays] of batchSchedules) {
    for (const [day, slots] of batchDays) {
      slots.sort((a, b) => a - b);
      
      let continuousCount = 1;
      for (let i = 1; i < slots.length; i++) {
        if (slots[i] - slots[i-1] <= 1) { // Adjacent or same slot
          continuousCount++;
        } else {
          // Check if we exceeded the limit
          if (continuousCount > CONFIG.MAX_CONTINUOUS_CLASSES) {
            penalty += continuousCount - CONFIG.MAX_CONTINUOUS_CLASSES;
          }
          continuousCount = 1;
        }
      }
      
      // Check final sequence
      if (continuousCount > CONFIG.MAX_CONTINUOUS_CLASSES) {
        penalty += continuousCount - CONFIG.MAX_CONTINUOUS_CLASSES;
      }
    }
  }
  
  return penalty;
};

// Calculate how well classes are clustered
const calculateClusteringPenalty = (individual: any[]): number => {
  let penalty = 0;
  const batchSchedules = groupByBatchAndDay(individual);
  
  for (const [batchId, batchDays] of batchSchedules) {
    for (const [day, slots] of batchDays) {
      slots.sort((a, b) => a - b);
      
      // Calculate clustering quality
      if (slots.length > 1) {
        let gaps = 0;
        for (let i = 1; i < slots.length; i++) {
          const gap = slots[i] - slots[i-1] - 1;
          if (gap > 0) gaps += gap;
        }
        
        // Penalty increases with gaps (scattered classes are bad)
        penalty += gaps * slots.length; // More classes = higher penalty for scattering
      }
    }
  }
  
  return penalty;
};

// Calculate distribution quality across days
const calculateDistributionPenalty = (individual: any[]): number => {
  const batchDayCounts = new Map<string, number[]>();
  
  // Count classes per day for each batch
  for (const session of individual) {
    if (!session.batch || !session.day) continue;
    
    if (!batchDayCounts.has(session.batch.id)) {
      batchDayCounts.set(session.batch.id, new Array(DAYS.length).fill(0));
    }
    
    const dayIndex = DAYS.indexOf(session.day);
    if (dayIndex >= 0) {
      batchDayCounts.get(session.batch.id)![dayIndex]++;
    }
  }
  
  let penalty = 0;
  for (const [batchId, dayCounts] of batchDayCounts) {
    // Calculate variance in distribution
    const mean = dayCounts.reduce((a, b) => a + b, 0) / dayCounts.length;
    const variance = dayCounts.reduce((acc, count) => acc + Math.pow(count - mean, 2), 0) / dayCounts.length;
    penalty += variance;
  }
  
  return penalty;
};

// Helper function to group sessions by batch and day
const groupByBatchAndDay = (individual: any[]) => {
  const grouped = new Map<string, Map<string, number[]>>();
  
  for (const session of individual) {
    if (!session.batch || !session.day || !session.slot) continue;
    
    if (!grouped.has(session.batch.id)) {
      grouped.set(session.batch.id, new Map());
    }
    
    const batchDays = grouped.get(session.batch.id)!;
    if (!batchDays.has(session.day)) {
      batchDays.set(session.day, []);
    }
    
    const slotIndex = parseInt(session.slot.split('-')[0].replace(':', ''));
    batchDays.get(session.day)!.push(slotIndex);
  }
  
  return grouped;
};

// Enhanced gap penalty calculation
const calculateGapPenalty = (individual: any[], inputData: OptimizerInput): number => {
  let penalty = 0;
  const batchSchedules = groupByBatchAndDay(individual);
  
  for (const [batchId, batchDays] of batchSchedules) {
    for (const [day, slots] of batchDays) {
      if (slots.length > 1) {
        slots.sort((a, b) => a - b);
        
        for (let i = 1; i < slots.length; i++) {
          const gap = slots[i] - slots[i-1] - 1;
          if (gap > 0) {
            penalty += gap;
          }
        }
      }
    }
  }
  
  return penalty;
};

// Enhanced mutation with clustering awareness
const mutateWithClustering = (
  individual: any[], 
  allFaculty: Faculty[], 
  rooms: Room[], 
  schedulableSlots: string[]
): any[] => {
  return individual.map(session => {
    if (Math.random() < CONFIG.MUTATION_RATE) {
      // Smarter mutation: try to maintain clustering
      const suitableFaculty = allFaculty.filter(f => 
        f.assignedCourses.includes(session.course.id)
      );
      
      const newFaculty = suitableFaculty.length > 0 
        ? suitableFaculty[Math.floor(Math.random() * suitableFaculty.length)] 
        : null;
      
      // For slot mutation, prefer staying close to original slot
      const currentSlotIndex = schedulableSlots.indexOf(session.slot);
      const maxShift = 2; // Don't move too far
      const minIndex = Math.max(0, currentSlotIndex - maxShift);
      const maxIndex = Math.min(schedulableSlots.length - 1, currentSlotIndex + maxShift);
      const newSlotIndex = Math.floor(Math.random() * (maxIndex - minIndex + 1)) + minIndex;
      
      return {
        ...session,
        day: Math.random() < 0.3 ? DAYS[Math.floor(Math.random() * DAYS.length)] : session.day,
        slot: schedulableSlots[newSlotIndex],
        room: Math.random() < 0.5 ? rooms[Math.floor(Math.random() * rooms.length)] : session.room,
        faculty: newFaculty,
      };
    }
    return session;
  });
};

// Generate quality metrics for result analysis
const calculateQualityMetrics = (individual: any[], inputData: OptimizerInput): QualityMetrics => {
  const conflicts = getHardConflicts(individual, inputData);
  const clusteringPenalty = calculateClusteringPenalty(individual);
  const distributionPenalty = calculateDistributionPenalty(individual);
  
  // Calculate utilization rate
  const totalSlots = DAYS.length * inputData.academicSettings.periods.length;
  const usedSlots = individual.length;
  const utilization = (usedSlots / (totalSlots * inputData.rooms.length)) * 100;
  
  return {
    clustering_score: Math.max(0, 100 - clusteringPenalty),
    distribution_score: Math.max(0, 100 - distributionPenalty * 10),
    conflict_count: conflicts.length,
    utilization_rate: Math.min(100, utilization)
  };
};

// Main enhanced optimization function
export const runEnhancedOptimization = async (
  input: OptimizerInput,
  updateProgress: (progress: number) => void
): Promise<OptimizationResult[]> => {
  const { departments, rooms, constraints, academicSettings } = input;
  const TIME_SLOTS = academicSettings.periods.map(p => `${p.start}-${p.end}`);
  const LUNCH_SLOT = `${academicSettings.lunchStartTime}-${academicSettings.lunchEndTime}`;
  const SCHEDULABLE_SLOTS = TIME_SLOTS.filter(slot => slot !== LUNCH_SLOT);

  const classSessions = createClassSessions(departments, input.targetSemester);
  const allFaculty = getAllFaculty(departments);

  if (classSessions.length === 0 || allFaculty.length === 0 || rooms.length === 0) {
    throw new Error("Insufficient data for optimization.");
  }

  const OPTIMIZATION_RUNS = 3;
  let allResults: OptimizationResult[] = [];

  for (let run = 0; run < OPTIMIZATION_RUNS; run++) {
    // Use enhanced initialization
    let population = initializePopulationClustered(
      classSessions, 
      allFaculty, 
      rooms, 
      CONFIG.POPULATION_SIZE, 
      SCHEDULABLE_SLOTS
    );

    let bestFitnessHistory = [];
    let stagnationCount = 0;

    for (let generation = 0; generation < CONFIG.MAX_GENERATIONS; generation++) {
      const fitnessScores = population.map(individual => 
        calculateEnhancedFitness(individual, input)
      );
      
      const bestFitness = Math.max(...fitnessScores);
      bestFitnessHistory.push(bestFitness);
      
      // Check for stagnation and adapt mutation rate
      if (generation > 10) {
        const recent = bestFitnessHistory.slice(-10);
        const improvement = recent[recent.length - 1] - recent[0];
        
        if (improvement < 1) {
          stagnationCount++;
          CONFIG.MUTATION_RATE = Math.min(0.1, CONFIG.MUTATION_RATE * 1.1); // Increase mutation
        } else {
          stagnationCount = 0;
          CONFIG.MUTATION_RATE = Math.max(0.02, CONFIG.MUTATION_RATE * 0.99); // Decrease mutation
        }
      }

      // Create new population
      let newPopulation = [];
      const sortedPopulation = population
        .map((ind, i) => ({ individual: ind, score: fitnessScores[i] }))
        .sort((a, b) => b.score - a.score);

      // Elitism
      for (let i = 0; i < CONFIG.ELITISM_COUNT; i++) {
        newPopulation.push(sortedPopulation[i].individual);
      }

      // Generate rest of population
      for (let i = 0; i < CONFIG.POPULATION_SIZE - CONFIG.ELITISM_COUNT; i++) {
        const parent1 = tournamentSelection(population, fitnessScores, CONFIG.TOURNAMENT_SIZE);
        const parent2 = tournamentSelection(population, fitnessScores, CONFIG.TOURNAMENT_SIZE);
        let child = crossover(parent1, parent2);
        child = mutateWithClustering(child, allFaculty, rooms, SCHEDULABLE_SLOTS);
        newPopulation.push(child);
      }

      population = newPopulation;

      // Update progress
      const totalProgress = (run / OPTIMIZATION_RUNS) * 100 + 
        (generation / CONFIG.MAX_GENERATIONS) * (100 / OPTIMIZATION_RUNS);
      updateProgress(5 + totalProgress * 0.9);
      await yieldToEventLoop();
    }

    // Get best result from this run
    const finalFitnessScores = population.map(individual => 
      calculateEnhancedFitness(individual, input)
    );
    const bestIndividual = population[finalFitnessScores.indexOf(Math.max(...finalFitnessScores))];
    const bestTimetable = individualToTimetable(bestIndividual, TIME_SLOTS);
    const bestConflicts = getHardConflicts(bestIndividual, input);
    const qualityMetrics = calculateQualityMetrics(bestIndividual, input);

    allResults.push({
      id: crypto.randomUUID(),
      name: `Enhanced Solution ${run + 1}`,
      timetable: bestTimetable,
      score: Math.max(...finalFitnessScores),
      conflicts: bestConflicts,
      quality_metrics: qualityMetrics,
      created_at: new Date().toISOString(),
    });
  }

  updateProgress(100);

  // Return results sorted by fitness score
  return allResults.sort((a, b) => b.score - a.score).slice(0, 3);
};

// Helper functions (reused from original with modifications)
const createClassSessions = (departments: Department[], targetSemester: number) => {
  // Same as original but with better session distribution logic
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
};

const yieldToEventLoop = () => new Promise(resolve => setTimeout(resolve, 0));

const tournamentSelection = (population: any[][], fitnessScores: number[], tournamentSize: number) => {
  let best = null;
  let bestFitness = -1;
  for (let i = 0; i < tournamentSize; i++) {
    const randomIndex = Math.floor(Math.random() * population.length);
    if (fitnessScores[randomIndex] > bestFitness) {
      bestFitness = fitnessScores[randomIndex];
      best = population[randomIndex];
    }
  }
  return best!;
};

const crossover = (parent1: any[], parent2: any[]): any[] => {
  // Enhanced crossover that tries to preserve clusters
  return parent1.map((gene, index) => {
    if (Math.random() < 0.5) return gene;
    
    // Try to maintain batch clustering when swapping
    const parent2Gene = parent2[index];
    if (gene.batch.id === parent2Gene.batch.id && gene.day === parent2Gene.day) {
      return parent2Gene; // Prefer same batch/day combinations
    }
    
    return Math.random() < 0.7 ? gene : parent2Gene;
  });
};

const getHardConflicts = (individual: any[], inputData: OptimizerInput): ConflictDetail[] => {
  // Enhanced version of original with severity levels
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
      if (classes.length > 1) conflicts.push({ 
        type: 'FACULTY_DOUBLE_BOOKED', day, slot, 
        message: `${classes[0].faculty.name} is booked for ${classes.length} classes.`, 
        involved: classes.map(c => c.course.id),
        severity: 'critical'
      });
    });
    
    roomsInSlot.forEach((classes) => {
      if (classes.length > 1) conflicts.push({ 
        type: 'ROOM_DOUBLE_BOOKED', day, slot, 
        message: `Room ${classes[0].room.name} is booked for ${classes.length} classes.`, 
        involved: classes.map(c => c.course.id),
        severity: 'critical'
      });
    });
    
    batchesInSlot.forEach((classes) => {
      if (classes.length > 1) conflicts.push({ 
        type: 'BATCH_DOUBLE_BOOKED', day, slot, 
        message: `Batch ${classes[0].batch.name} has ${classes.length} classes scheduled.`, 
        involved: classes.map(c => c.course.id),
        severity: 'critical'
      });
    });
  }

  // Check for unassigned faculty and capacity issues
  for (const c of individual) {
    if (!c.faculty) {
      conflicts.push({ 
        type: 'FACULTY_UNASSIGNED', day: c.day, slot: c.slot, 
        message: `Course ${c.course.name} has no faculty.`, 
        involved: [c.course.id],
        severity: 'high'
      });
    }
    if (c.room && c.batch && c.room.capacity < c.batch.studentCount) {
      conflicts.push({ 
        type: 'ROOM_CAPACITY', day: c.day, slot: c.slot, 
        message: `Room ${c.room.name} (Cap: ${c.room.capacity}) too small for ${c.batch.name} (${c.batch.studentCount}).`, 
        involved: [c.room.id, c.batch.id],
        severity: 'high'
      });
    }
  }

  return conflicts;
};

const individualToTimetable = (individual: any[], timeSlots: string[]) => {
  const timetable = Object.fromEntries(
    DAYS.map(day => [day, Object.fromEntries(timeSlots.map(slot => [slot, []]))])
  );
  
  for (const assignment of individual) {
    if(assignment.day && assignment.slot) {
      if(!timetable[assignment.day]) timetable[assignment.day] = {};
      if(!timetable[assignment.day][assignment.slot]) timetable[assignment.day][assignment.slot] = []
      timetable[assignment.day][assignment.slot].push(assignment);
    }
  }
  
  return timetable;
};