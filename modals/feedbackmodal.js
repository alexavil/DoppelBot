const debug = process.env.DEBUG;
import Sentry from "@sentry/node";
export default {
  name: "feedbackmodal",
  execute(interaction) {
    // currently broken, waiting for a fix
    /* const eventId = Sentry.captureMessage(interaction.fields.getTextInputValue("titleInput"));
    
    const userFeedback = {
      event_id: eventId,
      name: interaction.user.username,
      email: interaction.user.email,
      comments: interaction.fields.getTextInputValue("responseInput"),
    };
    Sentry.captureUserFeedback(userFeedback);
    */
    interaction.reply({ content: "Success!", ephemeral: true });
  },
};
