import { TextChannel } from "discord.js";
import { Event } from "../interfaces";
import { getGuilds } from "../modules/guild";
import { createMessage, getLevelUpMessagePayload } from "../modules/messages";
import { assignUserLevelRole } from "../modules/roles";

export const userLeveledUp: Event = {
    name: "userLeveledUp",
    run: async (client, user, sourceGuild) => {
        const sourceGuilds = await getGuilds();

        for await (const sG of sourceGuilds) {
            const guild = client.guilds.cache.get(sG.guildId);
            const { notifications, channelId, levelRoles } = sG;

            if (!guild) continue;

            if (levelRoles)
                await assignUserLevelRole(client, user, guild);

            if (!notifications || !channelId) continue;

            if (sourceGuild && (sG.guildId === sourceGuild.guildId)) {
                const channel = guild.channels.cache.get(sourceGuild.channelId) as TextChannel;
                if (!channel) continue;

                const levelUpMesssagePayload = await getLevelUpMessagePayload(client, user, guild);
                await channel.send(levelUpMesssagePayload)
                    .then(async message => {
                        await message.react("🎉");
                        await createMessage(message, user.id, "levelUpMessage");
                    })
                    .catch(error => {
                        console.log("Error while sending level up message: ", error);
                    });
            }
        }
    }
}