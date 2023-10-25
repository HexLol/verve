import ExtendedClient from "@/client/ExtendedClient";
import { UserDocument } from "@/modules/schemas/User";
import Colors from "@/utils/colors";
import { EmbedBuilder } from "discord.js";
import { ImageHexColors, getColorInt } from "..";
import { getExperienceProcentage, getUserRank } from "@/modules/user";
import i18n from "@/client/i18n";
import { getFollowers } from "@/modules/follow";
import { getUserLastActivityDetails } from "@/modules/activity";

const ProfileEmbed = async (client: ExtendedClient, user: UserDocument, colors: ImageHexColors, selfCall?: boolean) => {
    const rank = await getUserRank(user);
    const experienceProcentage = await getExperienceProcentage(user);
    const followers = await getFollowers(user.userId).then(followers => followers.length);
    const userLastActivityDetails = await getUserLastActivityDetails(client, user);

    const lastHeared = userLastActivityDetails.voice ? i18n.__mf("profile.lastVoiceActivity", {
        time: `<t:${userLastActivityDetails.voice.timestamp}:R>`,
        guild: `(${userLastActivityDetails.voice.guildName})`,
    }) : '';

    const lastSeen = userLastActivityDetails.presence ? i18n.__mf("profile.lastPresenceActivity", {
        time: `<t:${userLastActivityDetails.presence.timestamp}:R>`,
        guild: `(${userLastActivityDetails.presence.guildName})`,
    }) : '';

    const embed = new EmbedBuilder()
        .setColor(getColorInt(colors.Vibrant))
        .setTitle(user.username)
        .setThumbnail(user.avatarUrl)
        .setDescription(lastHeared + '\n' + lastSeen);

    embed.addFields([
            {
                name: `📊  **${i18n.__("profile.statistics")}**`,
                value: `** **`,
                inline: false,
            },
            {
                name: i18n.__("profile.rank"),
                value: `\`\`\`#${rank} ${rank === 1 ? '👑' : ''}\`\`\``,
                inline: true,
            },
            {
                name: i18n.__("profile.level"),
                value: `\`\`\`${user.stats.level} (${experienceProcentage}%)\`\`\``,
                inline: true,
            },
            {
                name: i18n.__("profile.followers"),
                value: `\`\`\`${followers}\`\`\``,
                inline: true,
            },
        ]);

    if (selfCall || user.stats.time.public) {
        embed.addFields([
            {
                name: `⏳  **${i18n.__("profile.timeStatistics")}**`,
                value: (selfCall && !user.stats.time.public) ?  `(*${i18n.__("profile.visibilityNotification")}*)` : `** **`,
                inline: false,
            },
            {
                name: i18n.__("profile.voice"),
                value: `\`\`\`${Math.round(user.stats.time.voice/3600)}H\`\`\``,
                inline: true,
            },
            {
                name: i18n.__("profile.overall"),
                value: `\`\`\`${Math.round(user.stats.time.presence/3600)}H\`\`\``,
                inline: true,
            },
        ]);
    }


    embed.addFields([
        {
            name: `📅  **${i18n.__("profile.temporaryVoiceTimeStatistics")}**`,
            value: `** **`,
            inline: false,
        },
        {
            name: i18n.__("notifications.todayVoiceTimeField"),
            value: `\`\`\`${Math.round(user.day.time.voice/3600)}H\`\`\``,
            inline: true,
        },
        {
            name: i18n.__("notifications.weekVoiceTimeField"),
            value: `\`\`\`${Math.round(user.week.time.voice/3600)}H\`\`\``,
            inline: true,
        },
        {
            name: i18n.__("notifications.monthVoiceTimeField"),
            value: `\`\`\`${Math.round(user.month.time.voice/3600)}H\`\`\``,
            inline: true,
        },
    ]);

    return embed;
};

const InformationEmbed = () => {
    const embed = new EmbedBuilder()
        .setColor(Colors.EmbedGray);

    return embed;
};

const ErrorEmbed = () => {
    const embed = new EmbedBuilder()
        .setColor(Colors.Red);

    return embed;
};

const WarningEmbed = () => {
    const embed = new EmbedBuilder()
        .setColor(Colors.Yellow);

    return embed;
};

export { InformationEmbed, ErrorEmbed, WarningEmbed, ProfileEmbed };