import { Select } from "../interfaces/Select";
import { setLocale, withGuildLocale } from "../modules/locale";
import { getConfigMessagePayload } from "../modules/messages";

export const localeSelect: Select = {
    customId: "localeSelect",
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });
        const selected = interaction.values[0];
        const guild = interaction.guild;

        client.i18n.setLocale(selected);
        await setLocale(guild!, selected);

        withGuildLocale(client, guild!);
        const configMessage = await getConfigMessagePayload(client, interaction.guild!);
        await interaction.followUp({ ...configMessage, ephemeral: true });
    }
}