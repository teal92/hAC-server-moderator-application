
/*
  RSSI Labs — Discord Moderator Application
  Handles validation and Formspree submissions.
*/

// Replace this with your Formspree form ID.
const FORMSPREE_FORM_ID = "REPLACE_WITH_YOUR_FORM_ID";

const form = document.getElementById("modForm");
const statusBox = document.getElementById("status");
const submitButton = document.getElementById("submitButton");

// Display submission feedback to the applicant.
function showStatus(message, type) {
  statusBox.hidden = false;
  statusBox.className = `status ${type}`;
  statusBox.textContent = message;
}

// Handle application submission.
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusBox.hidden = true;

  // Check that all required fields are completed.
  if (!form.reportValidity()) return;

  // Honeypot field to reduce automated spam.
  if (form.elements.namedItem("_gotcha").value.trim()) return;

  // Confirm the Formspree endpoint is configured.
  if (
    !/^[a-zA-Z0-9_-]+$/.test(FORMSPREE_FORM_ID) ||
    FORMSPREE_FORM_ID === "REPLACE_WITH_YOUR_FORM_ID"
  ) {
    showStatus(
      "Application submission hasn't been configured yet. Please contact the RSSI Labs server administrator.",
      "error"
    );
    return;
  }

  // Collect all application answers.
  const data = new FormData(form);

  // Combine multiple secondary moderator roles.
  const extras = data.getAll("secondary_roles");
  data.delete("secondary_roles");

  data.set(
    "secondary_roles",
    extras.length ? extras.join(", ") : "None"
  );

  // Set the email subject for application submissions.
  data.set(
    "_subject",
    "RSSI Labs Discord Moderator Application"
  );

  // Prevent duplicate submissions.
  submitButton.disabled = true;
  submitButton.textContent = "Submitting…";

  try {
    // Send application to Formspree.
    const response = await fetch(
      `https://formspree.io/f/${FORMSPREE_FORM_ID}`,
      {
        method: "POST",
        body: data,
        headers: {
          Accept: "application/json"
        }
      }
    );

    if (!response.ok) {
      throw new Error(
        `Submission service returned ${response.status}`
      );
    }

    // Show confirmation and clear the form.
    showStatus(
      "Application submitted successfully. Thank you! If selected for follow-up, we'll contact you on Discord.",
      "success"
    );

    form.reset();

    statusBox.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

  } catch (error) {
    console.error(
      "Moderator application submission failed:",
      error.message
    );

    showStatus(
      "We couldn't submit your application. Please try again later or contact a server administrator. Your answers are still on this page.",
      "error"
    );

  } finally {
    // Re-enable the submission button.
    submitButton.disabled = false;

    submitButton.innerHTML =
      'Submit application <span aria-hidden="true">→</span>';
  }
});
