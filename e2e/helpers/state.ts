import * as fs from 'fs';
import * as path from 'path';

const stateFile = path.resolve(__dirname, '../.test-state.json');

export interface TestState {
  totpSecret?: string;
  enrolledUsername?: string;
}

export function saveTestState(state: Partial<TestState>) {
  const current = getTestState();
  const updated = { ...current, ...state };
  fs.writeFileSync(stateFile, JSON.stringify(updated, null, 2), 'utf-8');
}

export function getTestState(): TestState {
  try {
    if (fs.existsSync(stateFile)) {
      return JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
    }
  } catch {
    // Ignore read errors
  }
  return {};
}

export function clearTestState() {
  try {
    if (fs.existsSync(stateFile)) {
      fs.unlinkSync(stateFile);
    }
  } catch {
    // Ignore cleanup errors
  }
}
