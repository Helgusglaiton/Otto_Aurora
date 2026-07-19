import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    if (!clientEmail || !privateKey) {
      console.warn("Google Sheets credentials not configured. Saving mock data.");
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000));
      return NextResponse.json({ success: true, mock: true, stats: { aurora: 65, otto: 35 } });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '1lzFHm3myhd7IxeLJeYNBnB2nQQbG-HJbHX0XQu9q1F8';

    // Ler votos existentes (Coluna E)
    let auroraCount = 0;
    let ottoCount = 0;

    try {
      const getRes = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Página1!E:E',
      });
      const rows = getRes.data.values || [];
      rows.forEach(row => {
        if (row[0] === 'Aurora') auroraCount++;
        if (row[0] === 'Otto') ottoCount++;
      });
    } catch (e) {
      console.error("Erro ao ler votos existentes:", e);
    }

    // Adicionar voto atual para o cálculo
    if (body.voto === 'Aurora') auroraCount++;
    if (body.voto === 'Otto') ottoCount++;

    // Salvar na planilha
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Página1!A:F',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [
          [new Date().toLocaleString('pt-BR'), body.nome, body.adultos, body.criancas, body.voto, body.mensagem]
        ],
      },
    });

    const total = auroraCount + ottoCount;
    const stats = total > 0 ? {
      aurora: Math.round((auroraCount / total) * 100),
      otto: Math.round((ottoCount / total) * 100),
    } : { aurora: 50, otto: 50 };

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error('Error saving RSVP:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
