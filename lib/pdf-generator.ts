import puppeteer from 'puppeteer';

export async function generatePlanPDF(htmlContent: string): Promise<Buffer> {
  let browser;
  
  try {
    const launchArgs: Parameters<typeof puppeteer.launch>[0] = {
      headless: true,
      timeout: 60000,
    };

    // Sandbox flags are mainly required in Linux/containerized environments.
    if (process.platform === 'linux') {
      launchArgs.args = ['--no-sandbox', '--disable-setuid-sandbox'];
    }

    browser = await puppeteer.launch(launchArgs);

    const page = await browser.newPage();
    page.setDefaultTimeout(60000);
    page.setDefaultNavigationTimeout(60000);
    
    // Avoid networkidle waits for static HTML to reduce timeout risk.
    await page.setContent(htmlContent, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      margin: {
        top: '1cm',
        right: '1cm',
        bottom: '1cm',
        left: '1cm',
      },
      printBackground: true,
      timeout: 60000,
    });

    return pdf;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export function createPlanHTML(data: {
  name: string;
  level: string;
  airport: string;
  professionGoal: string;
  dailyMinutes: number;
  weeklyGoal: number;
  weeks: Array<{
    week: number;
    title: string;
    focus: string[];
    targetPoints: number;
  }>;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #1a1a1a;
      background: white;
      padding: 40px;
    }
    
    .header {
      text-align: center;
      border-bottom: 3px solid #0066cc;
      padding-bottom: 30px;
      margin-bottom: 40px;
    }
    
    .header h1 {
      font-size: 32px;
      margin-bottom: 10px;
      color: #0066cc;
    }
    
    .header p {
      font-size: 14px;
      color: #666;
      margin-bottom: 5px;
    }
    
    .profile {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 40px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    
    .profile-item {
      font-size: 13px;
    }
    
    .profile-item strong {
      color: #0066cc;
      display: block;
      margin-bottom: 5px;
    }
    
    .section {
      margin-bottom: 40px;
    }
    
    .section h2 {
      font-size: 20px;
      margin-bottom: 20px;
      color: #0066cc;
      border-left: 4px solid #0066cc;
      padding-left: 12px;
    }
    
    .week {
      background: #f9f9f9;
      border-left: 4px solid #0066cc;
      padding: 15px;
      margin-bottom: 15px;
      page-break-inside: avoid;
    }
    
    .week-header {
      font-size: 14px;
      font-weight: bold;
      color: #0066cc;
      margin-bottom: 8px;
    }
    
    .week-title {
      font-size: 13px;
      margin-bottom: 10px;
      color: #333;
    }
    
    .focus-items {
      font-size: 12px;
      color: #666;
      list-style: none;
      padding-left: 0;
    }
    
    .focus-items li {
      padding: 3px 0;
      padding-left: 20px;
      position: relative;
    }
    
    .focus-items li:before {
      content: "→";
      position: absolute;
      left: 0;
      color: #0066cc;
    }
    
    .points {
      font-size: 11px;
      color: #999;
      margin-top: 8px;
      font-weight: 500;
    }
    
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      font-size: 12px;
      color: #999;
      text-align: center;
    }
    
    .page-break {
      page-break-after: always;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Plan d'apprentissage sur 12 semaines</h1>
    <p>Ravi's - Anglais professionnel pour l'aérien</p>
    <p>Généré le: ${new Date().toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    })}</p>
  </div>

  <div class="profile">
    <div class="profile-item">
      <strong>Nom de l'élève</strong>
      ${data.name}
    </div>
    <div class="profile-item">
      <strong>Niveau d'anglais</strong>
      ${data.level}
    </div>
    <div class="profile-item">
      <strong>Objectif professionnel</strong>
      ${data.professionGoal}
    </div>
    <div class="profile-item">
      <strong>Aéroport de référence</strong>
      ${data.airport}
    </div>
    <div class="profile-item">
      <strong>Temps quotidien</strong>
      ${data.dailyMinutes} minutes
    </div>
    <div class="profile-item">
      <strong>Objectif hebdomadaire</strong>
      ${data.weeklyGoal} heures
    </div>
  </div>

  <div class="section">
    <h2>Votre feuille de route sur 12 semaines</h2>
    
    <div style="margin-bottom: 30px;">
      <h3 style="color: #0066cc; font-size: 16px; margin-bottom: 10px;">Semaines 1-4: Phase Fondation</h3>
      <p style="font-size: 13px; color: #666; margin-bottom: 10px;">Consolider les bases avec le vocabulaire aéronautique essentiel.</p>
    </div>

    ${data.weeks.slice(0, 4).map(week => weekHTML(week)).join('')}
  </div>

  <div class="page-break"></div>

  <div class="section">
    <div style="margin-bottom: 30px;">
      <h3 style="color: #0066cc; font-size: 16px; margin-bottom: 10px;">Semaines 5-8: Phase Intermédiaire</h3>
      <p style="font-size: 13px; color: #666; margin-bottom: 10px;">Maîtriser les échanges de service client et les situations variées.</p>
    </div>

    ${data.weeks.slice(4, 8).map(week => weekHTML(week)).join('')}
  </div>

  <div class="section">
    <div style="margin-bottom: 30px;">
      <h3 style="color: #0066cc; font-size: 16px; margin-bottom: 10px;">Semaines 9-12: Phase Avancée</h3>
      <p style="font-size: 13px; color: #666; margin-bottom: 10px;">Perfectionner les compétences avec des scénarios avancés et une révision globale.</p>
    </div>

    ${data.weeks.slice(8, 12).map(week => weekHTML(week)).join('')}
  </div>

  <div class="footer">
    <p>Ce plan est personnalisé selon votre profil et vos objectifs.</p>
    <p>Suivez les modules hebdomadaires et cumulez des points Kiki pour suivre votre progression.</p>
  </div>
</body>
</html>
  `;
}

function weekHTML(week: { week: number; title: string; focus: string[]; targetPoints: number }): string {
  return `
    <div class="week">
      <div class="week-header">Semaine ${week.week}</div>
      <div class="week-title">${week.title}</div>
      <ul class="focus-items">
        ${week.focus.map(item => `<li>${item}</li>`).join('')}
      </ul>
      <div class="points">Objectif: ${week.targetPoints} points Kiki</div>
    </div>
  `;
}

