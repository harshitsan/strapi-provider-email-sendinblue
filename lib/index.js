"use strict";

const SibApiV3Sdk = require("sib-api-v3-sdk");
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const { removeUndefined } = require("strapi-utils");

module.exports = {
  init: (providerOptions = {}, settings = {}) => {
    const apiKey = defaultClient.authentications["api-key"];
    apiKey.apiKey = providerOptions.apiKey;

    return {
      send: async (options) => {
        try {
          // create contact
          if (!!options.contact) {
            const contactApi = new SibApiV3Sdk.ContactsApi();
            const createContact = new SibApiV3Sdk.CreateContact();
            createContact.email = options.contact.email;
            createContact.attributes = options.contact.attributes;
            createContact.updateEnabled = true;
            await contactApi.createContact(createContact);
          }

          const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
          const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

          sendSmtpEmail.sender = {
            email: options.from || settings.defaultFrom,
            name: options.fromName || settings.defaultFromName,
          };
          sendSmtpEmail.replyTo = {
            email: options.replyTo || settings.defaultReplyTo,
          };
          sendSmtpEmail.to = [{ email: options.to }];
          sendSmtpEmail.subject = options.subject;

          if (!!options.tags) sendSmtpEmail.tags = [...options.tags];

          if (!!options.templateId) {
            if (!!options.params) sendSmtpEmail.params = options.params;

            const template = await apiInstance.getSmtpTemplate(
              options.templateId
            );
            sendSmtpEmail.htmlContent = template.htmlContent;
          } else {
            sendSmtpEmail.htmlContent = options.html;
            sendSmtpEmail.textContent = options.text;
          }

          return await apiInstance.sendTransacEmail(sendSmtpEmail);
        } catch (error) {
          console.error(error);
        }
      },
    };
  },
};
