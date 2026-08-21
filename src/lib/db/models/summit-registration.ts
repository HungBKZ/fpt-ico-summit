/**
 * src/lib/db/models/summit-registration.ts
 *
 * Domain model for Member Summit Registration.
 */

import type { ObjectId } from "mongodb";

export type ParticipantType = "FPT_STUDENT" | "EXTERNAL_PARTICIPANT";

export type RegistrationStatus = "REGISTERED" | "CANCELLED";

export interface AttendeeSnapshot {
  fullName: string;
  phone: string;
  studentId?: string;
  email: string;
}

export interface SummitRegistration {
  _id?: ObjectId;

  /** Reference to active SummitEdition */
  editionId: ObjectId;

  /** Reference to authenticated Member User */
  userId: ObjectId;

  /** Participant category */
  participantType: ParticipantType;

  /** Historical snapshot of attendee information at registration time */
  attendeeSnapshot: AttendeeSnapshot;

  /** Registration lifecycle status */
  status: RegistrationStatus;

  /** Registration confirmation timestamp */
  registeredAt: Date;

  /** Cancellation timestamp if cancelled */
  cancelledAt?: Date | null;

  /** Creation timestamp */
  createdAt: Date;

  /** Update timestamp */
  updatedAt: Date;
}
