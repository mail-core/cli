export const PROCESS_PID = process.pid;

export const SUDO_UID = parseInt(process.env.SUDO_UID!) || 0;
export const IS_SUDO = SUDO_UID > 0;

export const CI_JOB_ID = process.env['CI_JOB_ID'] || null;
export const IS_CI_ENV = !!CI_JOB_ID;
