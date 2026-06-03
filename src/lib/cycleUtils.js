import { addDays, differenceInDays, format, parseISO, isWithinInterval, startOfDay } from 'date-fns';

const DEFAULT_CYCLE_LENGTH = 28;
const DEFAULT_PERIOD_LENGTH = 5;

export function calculateCycleDay(lastPeriodStart, today = new Date()) {
  if (!lastPeriodStart) return null;
  const start = typeof lastPeriodStart === 'string' ? parseISO(lastPeriodStart) : lastPeriodStart;
  const diff = differenceInDays(startOfDay(today), startOfDay(start));
  return diff >= 0 ? diff + 1 : null;
}

export function predictNextPeriod(lastPeriodStart, cycleLength = DEFAULT_CYCLE_LENGTH) {
  if (!lastPeriodStart) return null;
  const start = typeof lastPeriodStart === 'string' ? parseISO(lastPeriodStart) : lastPeriodStart;
  return addDays(start, cycleLength);
}

export function daysUntilNextPeriod(lastPeriodStart, cycleLength = DEFAULT_CYCLE_LENGTH, today = new Date()) {
  const next = predictNextPeriod(lastPeriodStart, cycleLength);
  if (!next) return null;
  // Signed: positive = days remaining, 0 = today, negative = days overdue.
  return differenceInDays(startOfDay(next), startOfDay(today));
}

export function getOvulationDate(lastPeriodStart, cycleLength = DEFAULT_CYCLE_LENGTH) {
  if (!lastPeriodStart) return null;
  const start = typeof lastPeriodStart === 'string' ? parseISO(lastPeriodStart) : lastPeriodStart;
  return addDays(start, cycleLength - 14);
}

export function getFertileWindow(lastPeriodStart, cycleLength = DEFAULT_CYCLE_LENGTH) {
  const ovulation = getOvulationDate(lastPeriodStart, cycleLength);
  if (!ovulation) return null;
  return {
    start: addDays(ovulation, -5),
    end: addDays(ovulation, 1),
  };
}

export function isOnPeriod(date, lastPeriodStart, periodLength = DEFAULT_PERIOD_LENGTH, cycleLength = DEFAULT_CYCLE_LENGTH) {
  if (!lastPeriodStart) return false;
  const start = typeof lastPeriodStart === 'string' ? parseISO(lastPeriodStart) : lastPeriodStart;
  const d = typeof date === 'string' ? parseISO(date) : date;
  
  const cycleDay = differenceInDays(startOfDay(d), startOfDay(start));
  if (cycleDay < 0) return false;
  const dayInCycle = cycleDay % cycleLength;
  return dayInCycle < periodLength;
}

export function getCyclePhase(cycleDay, cycleLength = DEFAULT_CYCLE_LENGTH, periodLength = DEFAULT_PERIOD_LENGTH) {
  if (!cycleDay || cycleDay < 1) return 'unknown';
  // Luteal phase is ~14 days, so ovulation tracks the cycle length rather than
  // assuming a fixed 28-day cycle. Menstrual length follows the user's period.
  const ovulationDay = cycleLength - 14;
  const menstrualEnd = Math.min(periodLength, cycleLength);

  if (cycleDay <= menstrualEnd) return 'menstrual';
  if (cycleDay < ovulationDay - 1) return 'follicular';
  if (cycleDay <= ovulationDay + 1) return 'ovulation';
  return 'luteal';
}

export function getPhaseInfo(phase) {
  const info = {
    menstrual: {
      label: 'Menstrual Phase',
      emoji: '🌺',
      color: 'text-primary',
      bg: 'bg-primary/10',
      tip: 'Rest well, stay hydrated, and be gentle with yourself.',
    },
    follicular: {
      label: 'Follicular Phase',
      emoji: '🌱',
      color: 'text-green-600',
      bg: 'bg-green-50',
      tip: 'Energy is rising! Great time for new projects and exercise.',
    },
    ovulation: {
      label: 'Ovulation Phase',
      emoji: '🌸',
      color: 'text-accent',
      bg: 'bg-accent/10',
      tip: 'You may feel most energetic and social during this phase.',
    },
    luteal: {
      label: 'Luteal Phase',
      emoji: '🍂',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      tip: 'PMS symptoms may appear. Focus on self-care and comfort foods.',
    },
    unknown: {
      label: 'Getting Started',
      emoji: '✨',
      color: 'text-muted-foreground',
      bg: 'bg-muted',
      tip: 'Log your period to start tracking your cycle!',
    },
  };
  return info[phase] || info.unknown;
}

export function getAverageCycleLength(cycleLogs) {
  if (!cycleLogs || cycleLogs.length < 2) return DEFAULT_CYCLE_LENGTH;
  
  const sorted = [...cycleLogs].sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
  let totalDays = 0;
  let count = 0;
  
  for (let i = 1; i < sorted.length; i++) {
    const diff = differenceInDays(parseISO(sorted[i].start_date), parseISO(sorted[i - 1].start_date));
    if (diff > 15 && diff < 45) {
      totalDays += diff;
      count++;
    }
  }
  
  return count > 0 ? Math.round(totalDays / count) : DEFAULT_CYCLE_LENGTH;
}

export const SYMPTOMS_LIST = [
  { id: 'cramps', label: 'Cramps', emoji: '😣' },
  { id: 'headache', label: 'Headache', emoji: '🤕' },
  { id: 'bloating', label: 'Bloating', emoji: '🎈' },
  { id: 'acne', label: 'Acne', emoji: '😤' },
  { id: 'fatigue', label: 'Fatigue', emoji: '😴' },
  { id: 'backpain', label: 'Back Pain', emoji: '💆' },
  { id: 'nausea', label: 'Nausea', emoji: '🤢' },
  { id: 'cravings', label: 'Cravings', emoji: '🍫' },
  { id: 'breast_tenderness', label: 'Breast Tenderness', emoji: '💗' },
  { id: 'insomnia', label: 'Insomnia', emoji: '🌙' },
  { id: 'mood_swings', label: 'Mood Swings', emoji: '🎭' },
  { id: 'dizziness', label: 'Dizziness', emoji: '💫' },
];

export const MOODS = [
  { id: 'happy', label: 'Happy', emoji: '😊' },
  { id: 'calm', label: 'Calm', emoji: '😌' },
  { id: 'energetic', label: 'Energetic', emoji: '⚡' },
  { id: 'sad', label: 'Sad', emoji: '😢' },
  { id: 'anxious', label: 'Anxious', emoji: '😰' },
  { id: 'irritable', label: 'Irritable', emoji: '😤' },
  { id: 'tired', label: 'Tired', emoji: '😴' },
  { id: 'emotional', label: 'Emotional', emoji: '🥺' },
];

export const FLOW_LEVELS = [
  { id: 'none', label: 'None', emoji: '⚪', color: 'bg-gray-200' },
  { id: 'spotting', label: 'Spotting', emoji: '🔵', color: 'bg-pink-200' },
  { id: 'light', label: 'Light', emoji: '🩸', color: 'bg-pink-300' },
  { id: 'medium', label: 'Medium', emoji: '🩸🩸', color: 'bg-pink-400' },
  { id: 'heavy', label: 'Heavy', emoji: '🩸🩸🩸', color: 'bg-pink-500' },
];