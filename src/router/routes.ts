import Express from "express";
import { db } from "../database/connect";

const NAMESPACE = "SERVER";

const router = Express.Router();

router.use((req, res, next) => {
  console.info(
    NAMESPACE,
    `METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`
  );
  res.on("finish", () => {
    console.info(
      NAMESPACE,
      `METHOD: [${req.method}] - URL: [${req.url}] - STATUS: [${res.statusCode}] - IP: [${req.socket.remoteAddress}]`
    );
  });
  next();
});

//ALL The router API's

router.post("/identify", async (req, res) => {
  const { email, phoneNumber } = req.body;

  if (!email && !phoneNumber) {
    return res.status(400).json({ error: "Email or phoneNumber is required" });
  }

  try {
    if ((email && !phoneNumber) || (!email && phoneNumber)) {
      const contactsQuery = `SELECT * FROM public."Contact" `;
      const [contacts] = await db.sql.query(contactsQuery);
      const contactArray = Array.isArray(contacts) ? contacts : [contacts];

      const primaryContact = contactArray.find(
        (c: any) => c.linkPrecedence === "primary"
      );
      const secondaryContacts = contactArray.filter(
        (c: any) => c.linkPrecedence === "secondary"
      );

      // Construct the response
      const response = {
        contact: {
          primaryContactId: primaryContact.id,
          emails: [
            ...new Set(
              [
                primaryContact.email,
                ...secondaryContacts.map((c: any) => c.email),
              ].filter(Boolean)
            ),
          ],
          phoneNumbers: [
            ...new Set(
              [
                primaryContact.phoneNumber,
                ...secondaryContacts.map((c: any) => c.phoneNumber),
              ].filter(Boolean)
            ),
          ],
          secondaryContactIds: secondaryContacts.map((c: any) => c.id),
        },
      };

      return res.status(200).json(response);
    }
    const contactsQuery = `
        SELECT * FROM public."Contact" 
        WHERE "email" = $email OR "phoneNumber" = $phoneNumber
      `;

    const [contacts] = await db.sql.query(contactsQuery, {
      bind: { email: email || null, phoneNumber: phoneNumber || null },
    });

    let contactArray = Array.isArray(contacts) ? contacts : [contacts];

    if (contactArray.length === 0) {
      const insertQuery = `
          INSERT INTO public."Contact" ("email", "phoneNumber", "linkPrecedence", "createdAt", "updatedAt")
          VALUES (:email, :phoneNumber, 'primary', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING *
        `;
      const [result] = await db.sql.query(insertQuery, {
        replacements: { email, phoneNumber },
      });
      const newContact = result[0];
      return res.status(200).json({
        contact: {
          primaryContactId: newContact.id,
          emails: [newContact.email].filter(Boolean),
          phoneNumbers: [newContact.phoneNumber].filter(Boolean),
          secondaryContactIds: [],
        },
      });
    }
    let primaryContact = contactArray.find(
      (c: any) => c.linkPrecedence === "primary"
    );

    let primaryContact1:any = contactArray.filter(
        (c: any) => c.linkPrecedence === "primary"
      );

    primaryContact1 = primaryContact1.find(((item:any) => (
        item.phoneNumber === phoneNumber
    )))

    let secondaryContacts = contactArray.filter(
      (c: any) => c.linkPrecedence === "secondary"
    );


    if (
      primaryContact1 &&
      ((email && primaryContact1.email !== email) ||
        (phoneNumber && primaryContact1.phoneNumber !== phoneNumber))
    ) {
      await db.sql.query(
        `UPDATE "Contact" SET "linkPrecedence" = 'secondary' WHERE "id" = :id`,
        {
          replacements: { id: primaryContact1.id },
        }
      );
      primaryContact.linkPrecedence = 'secondary';
      secondaryContacts = [...secondaryContacts, primaryContact1]; 
      const response = {
        contact: {
          primaryContactId:  primaryContact.id,
          emails: [
            ...new Set(
              [
                primaryContact?.email,
                primaryContact1?.email,
              ]
            ),
          ],
          phoneNumbers: [
            ...new Set(
              [
                primaryContact1?.phoneNumber,
                primaryContact.phoneNumber,
              ]
            ),
          ],
          secondaryContactIds: primaryContact1.id,
        },
      };

      return res.status(200).json(response);
    }

    if (!primaryContact) {
      primaryContact = contactArray[0];
      await db.sql.query(
        `UPDATE "Contact" SET "linkPrecedence" = 'primary' WHERE "id" = :id`,
        {
          replacements: { id: primaryContact.id },
        }
      );
    }

    const isExistingEmail =
      email && contactArray.some((c: any) => c.email === email);
    const isExistingPhoneNumber =
      phoneNumber &&
      contactArray.some((c: any) => c.phoneNumber === phoneNumber);

    if (isExistingEmail && isExistingPhoneNumber) {
      return res.status(200).json({
        contact: {
          primaryContactId: primaryContact.id,
          emails: [
            ...new Set(
              [
                primaryContact.email,
                ...secondaryContacts.map((c: any) => c.email),
              ].filter(Boolean)
            ),
          ],
          phoneNumbers: [
            ...new Set(
              [
                primaryContact.phoneNumber,
                ...secondaryContacts.map((c: any) => c.phoneNumber),
              ].filter(Boolean)
            ),
          ],
          secondaryContactIds: secondaryContacts.map((c: any) => c.id),
        },
      });
    }

    const newEmails = [];
    const newPhoneNumbers = [];

    if (email && !contactArray.some((c: any) => c.email === email)) {
      newEmails.push(email);
    }

    if (
      phoneNumber &&
      !contactArray.some((c: any) => c.phoneNumber === phoneNumber)
    ) {
      newPhoneNumbers.push(phoneNumber);
    }

    if (newEmails.length > 0 || newPhoneNumbers.length > 0) {
      const insertQuery = `
        INSERT INTO "Contact" ("email", "phoneNumber", "linkedId", "linkPrecedence", "createdAt", "updatedAt")
        VALUES (:email, :phoneNumber, :linkedId, 'secondary', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `;
      const [result] = await db.sql.query(insertQuery, {
        replacements: {
          email: newEmails?.length === 0 ? primaryContact?.email : newEmails[0],
          phoneNumber:
            newPhoneNumbers?.length === 0
              ? primaryContact?.phoneNumber
              : newPhoneNumbers[0],
          linkedId: primaryContact.id,
        },
      });

      const newSecondaryContact = result[0];
      secondaryContacts.push(newSecondaryContact);
    }

    res.status(200).json({
      contact: {
        primaryContactId: primaryContact.id,
        emails: [
          ...new Set(
            [
              primaryContact.email,
              ...secondaryContacts.map((c: any) => c.email),
              ...newEmails,
            ].filter(Boolean)
          ),
        ],
        phoneNumbers: [
          ...new Set(
            [
              primaryContact.phoneNumber,
              ...secondaryContacts.map((c: any) => c.phoneNumber),
              ...newPhoneNumbers,
            ].filter(Boolean)
          ),
        ],
        secondaryContactIds: secondaryContacts.map((c: any) => c.id),
      },
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.use((req, res, next) => {
  const error = new Error("Not Found");
  res.status(404).json({
    message: error.message,
  });
});

export default router;
