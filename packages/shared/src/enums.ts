/** Posiciones de jugador. Se usan en el roster, en las formaciones y en el diagram. */
export const POSITIONS = ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K', 'P'] as const;
export type Position = (typeof POSITIONS)[number];

/** Rol dentro de un equipo. En la Fase 1 solo existe COACH; PLAYER llegará en la Fase 3. */
export const TEAM_ROLES = ['COACH'] as const;
export type TeamRole = (typeof TEAM_ROLES)[number];

/** Unidad a la que pertenece un playbook o una formación. */
export const PLAYBOOK_SIDES = ['offense', 'defense', 'special'] as const;
export type PlaybookSide = (typeof PLAYBOOK_SIDES)[number];

/** Reglamento del equipo: define la separación de los hash marks. */
export const RULESETS = ['high_school', 'college', 'nfl'] as const;
export type Ruleset = (typeof RULESETS)[number];
