import { newId } from '@playbook/shared';

/** Se usa como `@Prop(UUID_ID) _id!: string;` en cada schema: UUIDv7 en lugar de ObjectId. */
export const UUID_ID = { type: String, default: () => newId() } as const;
