import ExtendedClient from "@/client/ExtendedClient";
import { ButtonBuilder } from "@discordjs/builders";
import { ActionRowBuilder, ButtonStyle, Message, UserResolvable } from "discord.js";
import { getMessage } from "@/modules/messages";
import { GuildDocument } from "@/modules/schemas/Guild";
import { UserDocument } from "@/modules/schemas/User";
import { getFollow } from "@/modules/follow";
import i18n from "@/client/i18n";
import { getRandomEmojiFromGroup, Groups } from "winemoji";

const getNotificationsButton = async (client: ExtendedClient, sourceGuild: GuildDocument) => {
    const notificationsButton = new ButtonBuilder()
        .setCustomId("notifications")
        .setLabel(i18n.__("config.notificationsButtonLabel"))
        .setStyle(sourceGuild.notifications ? ButtonStyle.Success : ButtonStyle.Secondary);

    return notificationsButton;
}

const getAutoSweepingButton = async (client: ExtendedClient, sourceGuild: GuildDocument) => {
    const autoSweepingButton = new ButtonBuilder()
        .setCustomId("autoSweeping")
        .setLabel(i18n.__("config.autoSweepingButtonLabel"))
        .setStyle(sourceGuild.autoSweeping ? ButtonStyle.Success : ButtonStyle.Secondary);

    return autoSweepingButton;
}

const getLevelRolesButton = async (client: ExtendedClient, sourceGuild: GuildDocument) => {
    const levelRolesButton = new ButtonBuilder()
        .setCustomId("levelRoles")
        .setLabel(i18n.__("config.levelRolesButtonLabel"))
        .setStyle(sourceGuild.levelRoles ? ButtonStyle.Success : ButtonStyle.Secondary);

    return levelRolesButton;
}

const getLevelRolesHoistButton = async (client: ExtendedClient, sourceGuild: GuildDocument) => {
    const levelRolesHoistButton = new ButtonBuilder()
        .setCustomId("levelRolesHoist")
        .setLabel(i18n.__("config.levelRolesHoistButtonLabel"))
        .setStyle(sourceGuild.levelRolesHoist ? ButtonStyle.Success : ButtonStyle.Secondary);

    return levelRolesHoistButton;
}

const getProfileTimePublicButton = async (client: ExtendedClient, sourceUser: UserDocument) => {
    const publicProfileButton = new ButtonBuilder()
        .setCustomId("profileTimePublic")
        .setLabel(i18n.__("profile.timePublicButtonLabel"))
        .setStyle(sourceUser.stats.time.public ? ButtonStyle.Success : ButtonStyle.Secondary);

    return publicProfileButton;
}

const getProfileFollowButton = async (client: ExtendedClient, sourceUser: UserDocument, targetUser: UserDocument) => {
    const following = await getFollow(sourceUser.userId, targetUser.userId);

    const followButton = new ButtonBuilder()
        .setCustomId("profileFollow")
        .setLabel(following ? i18n.__("profile.unfollowButtonLabel") : i18n.__("profile.followButtonLabel"))
        .setStyle(following ? ButtonStyle.Danger : ButtonStyle.Primary);

    return followButton;
}

const getRoleColorPickButton = () => {
    const roleColorPickButton = new ButtonBuilder()
        .setCustomId("roleColorPick")
        .setLabel(i18n.__("color.roleColorPickButtonLabel"))
        .setStyle(ButtonStyle.Secondary);

    return roleColorPickButton;
}

const getRoleColorUpdateButton = async () => {
    const roleColorUpdateButton = new ButtonBuilder()
        .setCustomId("roleColorUpdate")
        .setLabel(i18n.__("color.roleColorUpdateButtonLabel"))
        .setStyle(ButtonStyle.Secondary);

    return roleColorUpdateButton;
}

const getRoleColorDisableButton = () => {
    const roleColorDisableButton = new ButtonBuilder()
        .setCustomId("roleColorDisable")
        .setLabel(i18n.__("color.roleColorDisableButtonLabel"))
        .setStyle(ButtonStyle.Danger);
    
    return roleColorDisableButton
}

const getProfileButton = async (client: ExtendedClient, targetUserId?: UserResolvable) => {
    let profileButton;

    if (targetUserId) {
        const targetUser = await client.users.fetch(targetUserId);

        profileButton = new ButtonBuilder()
            .setCustomId("profile")
            .setLabel(i18n.__mf("quickButton.profileTargetLabel", { username: targetUser.username }))
            .setStyle(ButtonStyle.Primary);

        return profileButton;
    }

    profileButton = new ButtonBuilder()
        .setCustomId("profile")
        .setLabel(i18n.__("quickButton.profileLabel"))
        .setStyle(ButtonStyle.Primary);

    return profileButton;
}

const getSweepButton = async () => {
    const sweepButton = new ButtonBuilder()
        .setCustomId("sweep")
        .setLabel(i18n.__("quickButton.sweepLabel"))
        .setStyle(ButtonStyle.Secondary);

    return sweepButton;
};

const getRankingButton = async () => {
    const rankingButton = new ButtonBuilder()
        .setCustomId("ranking")
        .setLabel(i18n.__("quickButton.rankingLabel"))
        .setStyle(ButtonStyle.Primary);

    return rankingButton;
};

const getRankingPageUpButton = async (disabled = false) => {
    const rankingPageUpButton = new ButtonBuilder()
        .setCustomId("rankingPageUp")
        .setDisabled(disabled)
        .setLabel(i18n.__("ranking.pageUpButtonLabel"))
        .setStyle(ButtonStyle.Secondary);

    return rankingPageUpButton;
};

const getRankingPageDownButton = async (disabled = false) => {
    const rankingPageDownButton = new ButtonBuilder()
        .setCustomId("rankingPageDown")
        .setDisabled(disabled)
        .setLabel(i18n.__("ranking.pageDownButtonLabel"))
        .setStyle(ButtonStyle.Secondary);

    return rankingPageDownButton;
};

const getRankingGuildOnlyButton = async (newStatus: boolean) => {
    const rankingGuildOnlyButton = new ButtonBuilder()
        .setCustomId("rankingGuildOnly")
        .setLabel(newStatus ? i18n.__("ranking.guildOnlyButtonLabel") : i18n.__("ranking.allGuildsButtonLabel"))
        .setStyle(newStatus ? ButtonStyle.Success : ButtonStyle.Secondary);

    return rankingGuildOnlyButton;
}

const getRankingSettingsButton = async () => {
    const rankingSettingsButton = new ButtonBuilder()
        .setCustomId("rankingSettings")
        .setLabel(i18n.__("ranking.settingsButtonLabel"))
        .setStyle(ButtonStyle.Secondary);

    return rankingSettingsButton;
};

const getCommitsButton = async () => {
    const commitsButton = new ButtonBuilder()
        .setCustomId("commits")
        .setLabel(i18n.__("quickButton.commitsLabel"))
        .setStyle(ButtonStyle.Secondary);

    return commitsButton;
};

const getHelpButton = async () => {
    const helpButton = new ButtonBuilder()
        .setCustomId("help")
        .setLabel(`${i18n.__("quickButton.helpLabel")} ${getRandomEmojiFromGroup(Groups.AnimalsAndNature).char}`)
        .setStyle(ButtonStyle.Success);

    return helpButton;
};

const getRepoButton = async () => {
    const repoUrl = (await import("../../../../package.json")).repository.url;
    const repoButton = new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setURL(repoUrl)
        .setLabel(i18n.__("help.repoButtonLabel"));

    return repoButton;
}

const getQuickButtonsRows = async (client: ExtendedClient, message: Message) => {
    const sourceMessage = await getMessage(message.id);

    const row = new ActionRowBuilder<ButtonBuilder>();

    const profileButton = await getProfileButton(client, sourceMessage?.targetUserId || undefined);
    const sweepButton = await getSweepButton();
    const rankingButton = await getRankingButton();
    const helpButton = await getHelpButton();

    row.setComponents(sweepButton, profileButton, rankingButton, helpButton);

    return [row];
}

const getSelectMessageDeleteButton = async (disabled: boolean) => {
    const messageDeleteButton = new ButtonBuilder()
        .setCustomId("selectMessageDelete")
        .setLabel(i18n.__("select.messageDeleteButtonLabel"))
        .setStyle(ButtonStyle.Danger)
        .setDisabled(disabled);

    return messageDeleteButton;
}

const getSelectRerollButton = async (disabled: boolean) => {
    const rerollButton = new ButtonBuilder()
        .setCustomId("selectReroll")
        .setLabel(i18n.__("select.rerollButtonLabel"))
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(disabled);
    
    return rerollButton;
}

export { getRepoButton, getSelectRerollButton, getRankingGuildOnlyButton, getSelectMessageDeleteButton, getRoleColorDisableButton, getRankingSettingsButton, getHelpButton, getRankingPageUpButton, getRankingPageDownButton, getAutoSweepingButton, getRoleColorUpdateButton, getRoleColorPickButton, getQuickButtonsRows, getNotificationsButton, getLevelRolesButton, getLevelRolesHoistButton, getProfileTimePublicButton, getProfileFollowButton };