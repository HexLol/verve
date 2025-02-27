import { Guild } from "discord.js";
import mongoose from "mongoose";
import ExtendedClient from "@/client/ExtendedClient";
import GuildSchema, { GuildDocument } from "@/modules/schemas/Guild";

const GuildModel = mongoose.model("Guild", GuildSchema);

const createGuild = async (guild: Guild): Promise<GuildDocument> => {
    const exists = await GuildModel.findOne({ guildId: guild.id });
    if(exists) return exists;

    const newGuild = new GuildModel({ guildId: guild.id, channelId: null });
    await newGuild.save();
    return newGuild;
}

const deleteGuild = async (guild: Guild): Promise<boolean | null> => {
    const guildToDelete = await GuildModel.findOne({ guildId: guild.id });

    if(!guildToDelete) return null;

    await GuildModel.deleteOne({ guildId: guild.id });
    return true;
}

const getGuild = async (guild: Guild): Promise<GuildDocument | null> => {
    const exist = await GuildModel.findOne({ guildId: guild.id });
    if(!exist) return null;

    return exist;
}

const getGuilds = async (): Promise<GuildDocument[]> => {
    const guilds = await GuildModel.find();
    return guilds;
}

const setDefaultChannelId = async (guild: Guild, channelId: string): Promise<GuildDocument | null> => {
    const guildToUpdate = await GuildModel.findOne({ guildId: guild.id });
    if(!guildToUpdate) return null;

    guildToUpdate.channelId = channelId;
    await guildToUpdate.save();
    return guildToUpdate;
}

const setNotifications = async (guild: Guild): Promise<GuildDocument | null>  => {
    const guildToUpdate = await GuildModel.findOne({ guildId: guild.id });
    if(!guildToUpdate) return null;

    guildToUpdate.notifications = !guildToUpdate.notifications;
    await guildToUpdate.save();
    return guildToUpdate;
}

const setLevelRoles = async (guild: Guild): Promise<GuildDocument | null>  => {
    const guildToUpdate = await GuildModel.findOne({ guildId: guild.id });
    if(!guildToUpdate) return null;

    guildToUpdate.levelRoles = !guildToUpdate.levelRoles;
    await guildToUpdate.save();
    return guildToUpdate;
}

const setLevelRolesHoist = async (guild: Guild): Promise<GuildDocument | null>  => {
    const guildToUpdate = await GuildModel.findOne({ guildId: guild.id });
    if(!guildToUpdate) return null;

    guildToUpdate.levelRolesHoist = !guildToUpdate.levelRolesHoist;
    await guildToUpdate.save();
    return guildToUpdate;
}

const setAutoSweeing = async (guild: Guild): Promise<GuildDocument | null>  => {
    const guildToUpdate = await GuildModel.findOne({
        guildId: guild.id
    });

    if(!guildToUpdate) return null;

    guildToUpdate.autoSweeping = !guildToUpdate.autoSweeping;
    await guildToUpdate.save();
    return guildToUpdate;
}

const everyGuild = async (client: ExtendedClient, callback: (discordGuild: Guild, databaseGuild: GuildDocument) => void) => {
    const guilds = await getGuilds();

    if(!guilds.length) return new Error("No guilds found in database");
    
    guilds.forEach(async databaseGuild => {
        const discordGuild = await client.guilds.cache.get(databaseGuild.guildId);
        if(!discordGuild) return;

        await callback(discordGuild, databaseGuild);
    })
}

export { createGuild, setAutoSweeing, deleteGuild, setDefaultChannelId, getGuild, getGuilds, setNotifications, everyGuild, setLevelRoles, setLevelRolesHoist };