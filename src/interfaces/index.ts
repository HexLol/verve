export { Event } from "./Event";
export { Module } from "./Module";
export { User } from "./User";
export { Config } from "./Config";
export { Guild } from "./Guild";
export { Interaction } from "./Interaction";
export { PresenceActivity } from "./PresenceActivity";
export { VoiceActivity } from "./VoiceActivity";
export { Command } from "./Command";
export { Button } from "./Button";
export { Select } from "./Select";
export { SelectMenuOption } from "./SelectMenuOption";
export { ExtendedStatistics } from "./User";
export { Statistics } from "./User";
export { ContextMenu } from "./ContextMenu";
export { UserGuildActivityDetails } from './UserGuildActivityDetails';
export { Message } from './Message';
export { Sorting } from './Sorting';
export { Follow } from './Follow';
export { Modal } from './Modal';
export { EphemeralChannel } from './EphemeralChannel';

export type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
};