import { google } from "googleapis";

export const auth = new google.auth.GoogleAuth({
    keyFile: "smooth-verve-411510-825dce00373c.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
});

export const authClientObject = await auth.getClient();

export const googleSheetsInstance = google.sheets({ version: "v4", auth: authClientObject });

export const spreadsheetIdSaltyChart = "1JeC-evxsT3vLCHb1Lq0eIqjlZg40NWFTgeqTIpqlb2U";