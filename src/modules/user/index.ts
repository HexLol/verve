import mongoose from "mongoose";
import { User, Guild } from "discord.js";
import { User as DatabaseUser, Guild as DatabaseGuild, Sorting, Command } from "@/interfaces";
import userSchema, { UserDocument } from "@/modules/schemas/User";
import { ExtendedStatistics, ExtendedStatisticsPayload, Statistics } from "@/interfaces/User";
import ExtendedClient from "@/client/ExtendedClient";
import { InformationEmbed } from "@/modules/messages/embeds";
import { getColorInt, useImageHex } from "@/modules/messages";
import { GuildDocument } from "@/modules/schemas/Guild";
import i18n from "@/client/i18n";

const UserModel = mongoose.model("User", userSchema);

const expConstant = 0.3829;
const expInflationRate = 1;

const root = (x: number, n: number) => {
    return Math.pow(Math.E, Math.log(x) / n);
}

const expToLevel = (exp: number) => {
    return Math.floor(
        root(exp / expInflationRate, 3) * expConstant
    );
};

const levelToExp = (level: number) => {
    return Math.floor(
        Math.pow(level / expConstant, 3) * expInflationRate
    );
};

const createUser = async (user: User) => {
    const exists = await UserModel.findOne({ userId: user.id });
    if (exists) return exists;

    const newUser = new UserModel({
        userId: user.id,
        username: user.username,
        avatarUrl: user.displayAvatarURL({ extension: "png" })
    });

    await newUser.save();
    return newUser;
}

const deleteUser = async (user: User) => {
    const exists = await UserModel.findOne({ userId: user.id });
    if (!exists) return null;

    await UserModel.deleteOne({ userId: user.id });
    return true;
}

const getUser = async (user: User) => {
    if (user.bot)
        return null;

    let exists = await UserModel.findOne({ userId: user.id });

    if (!exists) {
        exists = await createUser(user);
    }

    return exists;
}

const getUserRank = async (user: DatabaseUser) => {
    const exists = await UserModel.findOne({ userId: user.userId });
    if (!exists) return null;

    const users = await UserModel.find();
    const sorted = users.sort((a, b) => b.stats.exp - a.stats.exp);
    const rank = sorted.findIndex(u => u.userId === user.userId) + 1;

    return rank;
};

const getUsers = async () => {
    const users = await UserModel.find();
    return users;
}

const updateUser = async (user: User) => {
    let exists = await UserModel.findOne({ userId: user.id });
    if (!exists) {
        exists = await createUser(user);
    }

    exists.username = user.username;
    exists.avatarUrl = user.displayAvatarURL({ extension: "png" });

    await exists.save();

    return exists;
}

const migrateUsername = async (user: User) => {
    let exists = await UserModel.findOne({ userId: user.id });
    if (!exists) {
        exists = await createUser(user);
    }

    exists.username = user.username;
    exists.set("tag", undefined, { strict: false });

    await exists.save();

    return exists;
}

const setPublicTimeStats = async (user: User) => {
    let exists = await UserModel.findOne({ userId: user.id });
    if (!exists) {
        exists = await createUser(user);
    }

    exists.stats.time.public = !exists.stats.time.public;

    await exists.save();
    return exists;
}

const updateUserStatistics = async (client: ExtendedClient, user: User, extendedStatisticsPayload: ExtendedStatisticsPayload, sourceGuild?: DatabaseGuild) => {
    const userSource = await updateUser(user) as UserDocument;
    const newExtendedStatistics: ExtendedStatistics = {
        level: userSource.stats.level + (extendedStatisticsPayload.level || 0),
        exp: userSource.stats.exp + (extendedStatisticsPayload.exp || 0),
        time: {
            public: userSource.stats.time.public || (extendedStatisticsPayload.time?.public || false),
            voice: userSource.stats.time.voice + (extendedStatisticsPayload.time?.voice || 0),
            presence: userSource.stats.time.presence + (extendedStatisticsPayload.time?.presence || 0)
        },
        commands: userSource.stats.commands + (extendedStatisticsPayload.commands || 0),
        games: {
            won: {
                skill: userSource.stats.games.won.skill + (extendedStatisticsPayload.games?.won?.skill || 0),
                skin: userSource.stats.games.won.skin + (extendedStatisticsPayload.games?.won?.skin || 0)
            }
        }
    };
    const day: Statistics = {
        exp: userSource.day.exp + (extendedStatisticsPayload.exp || 0),
        time: {
            public: userSource.stats.time.public || (extendedStatisticsPayload.time?.public || false),
            voice: userSource.day.time.voice + (extendedStatisticsPayload.time?.voice || 0),
            presence: userSource.day.time.presence + (extendedStatisticsPayload.time?.presence || 0)
        },
        games: {
            won: {
                skill: userSource.day.games.won.skill + (extendedStatisticsPayload.games?.won?.skill || 0),
                skin: userSource.day.games.won.skin + (extendedStatisticsPayload.games?.won?.skin || 0)
            }
        }
    }
    const week: Statistics = {
        exp: userSource.week.exp + (extendedStatisticsPayload.exp || 0),
        time: {
            public: userSource.stats.time.public || (extendedStatisticsPayload.time?.public || false),
            voice: userSource.week.time.voice + (extendedStatisticsPayload.time?.voice || 0),
            presence: userSource.week.time.presence + (extendedStatisticsPayload.time?.presence || 0)
        },
        games: {
            won: {
                skill: userSource.week.games.won.skill + (extendedStatisticsPayload.games?.won?.skill || 0),
                skin: userSource.week.games.won.skin + (extendedStatisticsPayload.games?.won?.skin || 0)
            }
        }
    }
    const month: Statistics = {
        exp: userSource.month.exp + (extendedStatisticsPayload.exp || 0),
        time: {
            public: userSource.stats.time.public || (extendedStatisticsPayload.time?.public || false),
            voice: userSource.month.time.voice + (extendedStatisticsPayload.time?.voice || 0),
            presence: userSource.month.time.presence + (extendedStatisticsPayload.time?.presence || 0)
        },
        games: {
            won: {
                skill: userSource.month.games.won.skill + (extendedStatisticsPayload.games?.won?.skill || 0),
                skin: userSource.month.games.won.skin + (extendedStatisticsPayload.games?.won?.skin || 0)
            }
        }
    }

    userSource.stats = newExtendedStatistics;
    userSource.day = day;
    userSource.week = week;
    userSource.month = month;

    let userLeveledUpDuringUpdate = false; // Flag

    if (userSource.stats.exp >= levelToExp(userSource.stats.level + 1)) // When exceed exp needed to level up
        userLeveledUpDuringUpdate = true; // Mark flag to emit event

    userSource.stats.level = expToLevel(userSource.stats.exp); // Update level

    await userSource.save();

    if (userLeveledUpDuringUpdate)
        client.emit("userLeveledUp", user, sourceGuild); // Emiting event

    return userSource;
};

const getNewFeatures = async (client: ExtendedClient, user: User) => {
    const userDocument = await getUser(user);

    const newCommands = client.commands.filter(
        (command) => command.options?.level && command.options.level == userDocument?.stats.level
    );

    return {
        commands: newCommands
    }
};

const commandFeature = (client: ExtendedClient, command: Command) => {
    const cmd = client.application?.commands.cache.find((c) => c.name === command.data.name);

    return `</${cmd?.name}:${cmd?.id}> (${cmd?.dmPermission ? i18n.__("newFeatures.global") : i18n.__("newFeatures.guildOnly") })`;
}

const sendNewFeaturesMessage = async (client: ExtendedClient, user: User, sourceGuild: GuildDocument) => {
    if(sourceGuild) {
        const guild = client.guilds.cache.get(sourceGuild.guildId);
        i18n.setLocale(guild?.preferredLocale || "en-US");
    }

    await client.application?.commands.fetch();
    const newFeatures = await getNewFeatures(client, user);
    if (!newFeatures.commands.size) return;

    const colors = await useImageHex(user.avatarURL({ extension: "png" }));

    const embed = InformationEmbed()
        .setTitle(i18n.__("newFeatures.title"))
        .setColor(getColorInt(colors.Vibrant))
        .setDescription(i18n.__("newFeatures.description"))
        .setFields([
            {
                name: i18n.__("newFeatures.commands"),
                value: newFeatures.commands.map((command) => commandFeature(client, command)).join("\n"),
                inline: true
            }
        ])
        .setThumbnail("https://i.imgur.com/cSTkdFG.png");

    await user.send({ embeds: [embed] });
};

const everyUser = async (callback: (user: UserDocument) => Promise<void>) => {
    const users = await getUsers();
    const promises = users.map(async (user) => await callback(user));
    await Promise.all(promises);
}

const clearExperience = async () => {
    await UserModel.updateMany({}, { $set: { "stats.exp": 0, "stats.level": 0 } });
}

const getRanking = async (type: Sorting, page: number, perPage: number, guild?: Guild, userIds?: string[]) => {
    const usersFilter = new Set<string>();

    if (userIds?.length) {
        userIds.forEach((userId) => usersFilter.add(userId));
    }

    if (guild && !userIds?.length) {
        const guildUserIds = guild.members.cache.map((member) => member.user.id);
        guildUserIds.forEach((userId) => {
            usersFilter.add(userId);
        });
    }

    const query = usersFilter.size ? {
        userId: { $in: Array.from(usersFilter) },
    } : {};

    const results = await UserModel.find(query).sort(type.sort);

    const pagesCount = Math.ceil((await UserModel.countDocuments(query)) / perPage) || 1;

    const onPage = results.slice((page - 1) * perPage, page * perPage);

    return {
        onPage,
        pagesCount
    }
};

const clearTemporaryStatistics = async (type: string) => {
    const blankTemporaryStatistic = {
        exp: 0,
        time: {
            public: false,
            voice: 0,
            presence: 0
        },
        games: {
            won: {
                skill: 0,
                skin: 0
            }
        }
    };

    everyUser(async (sourceUser) => {
        switch (type) {
            case "day":
                sourceUser.day = blankTemporaryStatistic;
                break;
            case "week":
                sourceUser.week = blankTemporaryStatistic;
                break;
            case "month":
                sourceUser.month = blankTemporaryStatistic;
                break;
        }
        await sourceUser.save();
    });
};

export { setPublicTimeStats, sendNewFeaturesMessage, getRanking, migrateUsername, createUser, deleteUser, getUser, getUserRank, getUsers, updateUser, updateUserStatistics, expToLevel, levelToExp, everyUser, clearTemporaryStatistics, UserModel, clearExperience };