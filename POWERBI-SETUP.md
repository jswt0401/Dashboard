# Power BI Integration - Opsætningsguide

Denne guide hjælper dig med at konfigurere Power BI integration til dit dashboard, så du kan hente data direkte fra Power BI Service.

## Oversigt

For at forbinde til Power BI Service skal du:
1. Oprette en Azure AD applikation
2. Konfigurere de korrekte tilladelser
3. Få dit Application (Client) ID
4. Bruge ID'et i dashboardet

---

## Trin 1: Opret Azure AD Applikation

### 1.1 Log ind på Azure Portal
- Gå til [Azure Portal](https://portal.azure.com)
- Log ind med din Microsoft-konto

### 1.2 Naviger til Azure Active Directory
1. I Azure Portal, søg efter "Azure Active Directory" i søgefeltet øverst
2. Klik på "Azure Active Directory" i resultaterne

### 1.3 Opret ny applikation
1. I venstre menu, klik på **"App registrations"** (App-registreringer)
2. Klik på **"New registration"** (Ny registrering) øverst
3. Udfyld følgende:
   - **Name**: "Dashboard Power BI Integration" (eller vælg dit eget navn)
   - **Supported account types**: Vælg "Accounts in any organizational directory and personal Microsoft accounts"
   - **Redirect URI**:
     - Type: Vælg **"Single-page application (SPA)"**
     - URL: Indtast din dashboard URL (f.eks. `http://localhost:8000/` eller din produktions URL)
4. Klik **"Register"**

---

## Trin 2: Noter Application (Client) ID

Efter registreringen:
1. Du vil se en **"Overview"** side for din nye applikation
2. Find og kopier **"Application (client) ID"**
   - Dette er et UUID format (f.eks. `12345678-1234-1234-1234-123456789abc`)
3. **GEM DETTE ID** - du skal bruge det i dashboardet

---

## Trin 3: Konfigurer API Tilladelser

### 3.1 Tilføj Power BI tilladelser
1. I venstre menu, klik på **"API permissions"** (API-tilladelser)
2. Klik på **"Add a permission"** (Tilføj en tilladelse)
3. Vælg **"Power BI Service"**
4. Vælg **"Delegated permissions"**
5. Marker følgende tilladelser:
   - ✅ `Dataset.Read.All` - Læs alle datasets
   - ✅ `Report.Read.All` - Læs alle rapporter
   - ✅ `Workspace.Read.All` - Læs alle workspaces (valgfri)
6. Klik **"Add permissions"**

### 3.2 Grant admin consent (hvis nødvendigt)
- Hvis du har administratorrettigheder, klik på **"Grant admin consent for [din organisation]"**
- Ellers skal en administrator godkende tilladelserne

---

## Trin 4: Konfigurer Authentication

### 4.1 Aktivér Implicit Grant Flow
1. I venstre menu, klik på **"Authentication"**
2. Under **"Implicit grant and hybrid flows"**:
   - ✅ Marker **"Access tokens (used for implicit flows)"**
   - ✅ Marker **"ID tokens (used for implicit and hybrid flows)"**
3. Klik **"Save"** nederst

### 4.2 Tilføj ekstra Redirect URIs (hvis nødvendigt)
- Hvis du tester lokalt OG har produktion, tilføj begge URLs:
  - `http://localhost:8000/`
  - `https://din-produktions-url.com/`

---

## Trin 5: Brug Application ID i Dashboard

### 5.1 Åbn dashboardet
1. Åbn din dashboard applikation i browseren
2. Find **"Power BI"** sektionen øverst

### 5.2 Indtast Client ID
1. Indsæt det **Application (client) ID** du kopierede i Trin 2
2. Klik **"Gem"**

### 5.3 Forbind til Power BI
1. Klik på **"Forbind til Power BI"** knappen
2. Du vil blive omdirigeret til Microsoft login siden
3. Log ind med din Microsoft-konto
4. Accepter de tilladelser der anmodes om
5. Du vil blive omdirigeret tilbage til dashboardet

---

## Trin 6: Hent Data fra Power BI

Efter succesfuld forbindelse:

1. **Vælg Workspace**: Vælg det workspace hvor dine datasets ligger
   - "Mit Workspace" er default workspace
   - Andre workspaces vises i dropdown

2. **Vælg Dataset**: Vælg det dataset du vil hente data fra

3. **Vælg Tabel**: Vælg den specifikke tabel i datasættet

4. **Angiv Max Rækker**: Vælg hvor mange rækker du vil hente (default: 1000)

5. **Indlæs Data**: Klik på "Indlæs Data" knappen

Dataene vil blive hentet fra Power BI og vist i dashboardet med statistikker og visualiseringer!

---

## Fejlfinding

### Problem: "Client ID not set" fejl
**Løsning**: Sørg for at du har indtastet og gemt dit Application (client) ID

### Problem: "Authentication expired" fejl
**Løsning**: Access tokens udløber efter 1 time. Klik "Forbind til Power BI" igen for at få et nyt token.

### Problem: "Not authorized" eller 403 fejl
**Løsninger**:
- Tjek at du har de korrekte API tilladelser i Azure AD
- Sørg for at admin consent er givet (hvis påkrævet)
- Verificer at du er logget ind med den rigtige Microsoft-konto
- Tjek at du har adgang til det workspace/dataset du prøver at tilgå

### Problem: Ingen workspaces eller datasets vises
**Løsninger**:
- Sørg for at du har publiceret datasets til Power BI Service (ikke kun Power BI Desktop)
- Tjek at du er logget ind med den samme konto som har adgang til datasets
- Verificer at datasets ikke er slettet eller flyttet

### Problem: "CORS" eller "Blocked" fejl
**Løsning**:
- Sørg for at din Redirect URI i Azure AD matcher din faktiske dashboard URL præcist
- Inkluder både HTTP/HTTPS og trailing slash hvis nødvendigt

---

## Sikkerhedsanbefalinger

1. **Beskyt dit Client ID**:
   - Selvom Client ID ikke er en hemmelighed, bør du ikke dele det offentligt
   - Brug miljø-specifikke registreringer for udvikling vs. produktion

2. **Redirect URIs**:
   - Tilføj kun de URLs der er nødvendige
   - Fjern test/udviklings URLs fra produktions-registreringen

3. **API Tilladelser**:
   - Giv kun de mindste nødvendige tilladelser
   - Dataset.Read.All og Report.Read.All er tilstrækkelige for denne integration

4. **Token Udløb**:
   - Access tokens udløber efter 1 time
   - Brugere skal re-authentikere efter udløb
   - Tokens gemmes i browser localStorage

---

## Ekstra Resourcer

- [Azure AD App Registration Documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
- [Power BI REST API Documentation](https://docs.microsoft.com/en-us/rest/api/power-bi/)
- [Power BI Developer Documentation](https://docs.microsoft.com/en-us/power-bi/developer/)

---

## Support

Hvis du støder på problemer der ikke er dækket i denne guide:

1. Tjek browser konsollen (F12) for detaljerede fejlmeddelelser
2. Verificer alle trin i Azure AD konfigurationen
3. Sørg for at du har aktive datasets i Power BI Service

---

**Held og lykke med din Power BI integration! 🚀**
