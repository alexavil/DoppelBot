export default {
  name: "cancel",
  async execute(interaction) {
    return interaction.update({content: "Cancelled!", components: [], ephemeral: true});
  },
};
