// Examenprogramma data gebaseerd op officiële examenprogramma's van examenblad.nl (2026)

export interface ExamDomain {
    code: string;        // e.g. "A", "B1", "C2"
    title: string;
    subdomains?: ExamDomain[];
    description?: string;
}

export interface ExamProgram {
    domains: ExamDomain[];
    source: string;      // URL naar examenblad.nl
    examType: string;    // "CE" of "SE+CE"
}

interface InfoContent {
    title: string;
    content: string;
}

interface SubjectExamInfo {
    syllabus: InfoContent;
    components: InfoContent;
    examProgram: ExamProgram;
}

interface ExamInfo {
    [subject: string]: SubjectExamInfo;
}

export const examInfo: ExamInfo = {
    Nederlands: {
        syllabus: {
            title: 'Syllabus Nederlands VWO',
            content: `
### Domein A: Leesvaardigheid
- Analyseren en interpreteren van diverse tekstsoorten (o.a. betogende, beschouwende en uiteenzettende teksten).
- Herkennen van tekststructuren, hoofdgedachten en functies van tekstgedeelten.
- Beoordelen van de betrouwbaarheid en representativiteit van informatie.

### Domein B: Argumentatieve vaardigheden
- Herkennen en analyseren van argumentatieschema's en redeneringen.
- Beoordelen van de aanvaardbaarheid van argumentatie.
- Herkennen en benoemen van drogredenen.

### Domein C: Mondelinge taalvaardigheid
- (Niet getoetst in het Centraal Examen, wel in het schoolexamen)

### Domein D: Schrijfvaardigheid
- (Niet getoetst in het Centraal Examen, wel in het schoolexamen)
`
        },
        components: {
            title: 'Examenonderdelen Nederlands VWO',
            content: `
Het Centraal Examen Nederlands VWO bestaat doorgaans uit:

### 1. Teksten met open vragen
- **Weging:** Ongeveer 70-80% van de totale score.
- **Inhoud:** Je krijgt 3 tot 4 teksten van uiteenlopende aard.
- **Vragen:** Toetsen lees- en argumentatievaardigheid.

### 2. Samenvattingsopdracht (indien van toepassing)
- **Weging:** Ongeveer 20-30% van de totale score.
- **Inhoud:** Een van de examenteksten samenvatten volgens specifieke instructies.
`
        },
        examProgram: {
            source: 'https://www.examenblad.nl/2026/vwo/vakken/talen/nederlands-vwo',
            examType: 'CE',
            domains: [
                {
                    code: 'A', title: 'Leesvaardigheid', subdomains: [
                        { code: 'A1', title: 'Analyseren en interpreteren van zakelijke teksten' },
                        { code: 'A2', title: 'Beoordelen van teksten op argumentatie, doel en publiek' },
                        { code: 'A3', title: 'Samenvatten van teksten' },
                    ]
                },
                {
                    code: 'B', title: 'Argumentatieve vaardigheden', subdomains: [
                        { code: 'B1', title: 'Herkennen en benoemen van argumentatieschema\'s' },
                        { code: 'B2', title: 'Beoordelen van argumentatie op geldigheid en aanvaardbaarheid' },
                        { code: 'B3', title: 'Herkennen van drogredenen' },
                    ]
                },
                { code: 'C', title: 'Mondelinge taalvaardigheid', description: 'Alleen schoolexamen' },
                { code: 'D', title: 'Schrijfvaardigheid', description: 'Alleen schoolexamen' },
                { code: 'E', title: 'Literatuur', description: 'Alleen schoolexamen' },
            ]
        }
    },
    Engels: {
        syllabus: {
            title: 'Syllabus Engels VWO',
            content: `
### Domein A: Leesvaardigheid
- **Tekstbegrip:** Begrijpen van authentieke Engelse teksten op C1-niveau.
- **Tekstsoorten:** Nieuwsartikelen, recensies, opiniestukken en literaire fragmenten.
- **Woordenschat:** Brede woordenschat op C1-niveau.
- **Analyse:** Toon, doel en structuur van tekst herkennen.
`
        },
        components: {
            title: 'Examenonderdelen Engels VWO',
            content: `
Het Centraal Examen Engels VWO is volledig gericht op leesvaardigheid.

### Teksten met vragen
- **Weging:** 100% van de totale score.
- **Inhoud:** ~10-12 teksten, variërend in lengte en onderwerp.
- **Vraagtypen:** Grotendeels meerkeuzevragen met open vragen.
`
        },
        examProgram: {
            source: 'https://www.examenblad.nl/2026/vwo/vakken/talen/engels-vwo',
            examType: 'CE',
            domains: [
                {
                    code: 'A', title: 'Leesvaardigheid', subdomains: [
                        { code: 'A1', title: 'Lezen van teksten in het Engels (informatief, persuasief, artistiek-literair)' },
                        { code: 'A2', title: 'Verwerven, verwerken en beoordelen van informatie' },
                        { code: 'A3', title: 'Woordenschat en idioom op C1-niveau' },
                    ]
                },
                { code: 'B', title: 'Luistervaardigheid', description: 'Alleen schoolexamen' },
                { code: 'C', title: 'Gespreksvaardigheid', description: 'Alleen schoolexamen' },
                { code: 'D', title: 'Schrijfvaardigheid', description: 'Alleen schoolexamen' },
                { code: 'E', title: 'Literatuur', description: 'Alleen schoolexamen' },
            ]
        }
    },
    Natuurkunde: {
        syllabus: {
            title: 'Syllabus Natuurkunde VWO',
            content: `
### Hoofddomeinen
- **Mechanica:** Kinematica, dynamica, arbeid en energie, trillingen en golven.
- **Elektriciteit en Magnetisme:** Elektrische circuits, velden, inductie.
- **Thermodynamica:** Warmte, temperatuur, gassen en de hoofdwetten.
- **Golven en Straling:** Elektromagnetisch spectrum, optica, kwantumfysica.
- **Medische Beeldvorming:** Toepassingen in de medische wereld.
`
        },
        components: {
            title: 'Examenonderdelen Natuurkunde VWO',
            content: `
Het Centraal Examen Natuurkunde VWO bestaat uit open vragen, vaak onderverdeeld in deelvragen.

### Vraagtypen
- **Rekenopgaven:** Formules toepassen (Binas!).
- **Uitlegvragen:** Verschijnselen verklaren.
- **Redeneervragen:** Conclusies afleiden.
`
        },
        examProgram: {
            source: 'https://www.examenblad.nl/2026/vwo/vakken/exacte-vakken/natuurkunde-vwo',
            examType: 'CE',
            domains: [
                {
                    code: 'A', title: 'Vaardigheden', subdomains: [
                        { code: 'A1', title: 'Informatievaardigheden' },
                        { code: 'A2', title: 'Onderzoeksvaardigheden' },
                        { code: 'A3', title: 'Technisch ontwerpen' },
                        { code: 'A4', title: 'Rekenkundige en wiskundige vaardigheden' },
                    ]
                },
                {
                    code: 'B', title: 'Golven', subdomains: [
                        { code: 'B1', title: 'Mechanische golven (transversaal, longitudinaal, staande golven)' },
                        { code: 'B2', title: 'Licht en elektromagnetische straling' },
                    ]
                },
                {
                    code: 'C', title: 'Beweging en wisselwerking', subdomains: [
                        { code: 'C1', title: 'Kinematica (eenparig, eenparig versneld)' },
                        { code: 'C2', title: 'Krachten en wetten van Newton' },
                        { code: 'C3', title: 'Arbeid, energie en vermogen' },
                        { code: 'C4', title: 'Impuls en botsingen' },
                    ]
                },
                {
                    code: 'D', title: 'Lading en veld', subdomains: [
                        { code: 'D1', title: 'Elektrische velden en potentiaal' },
                        { code: 'D2', title: 'Magnetische velden en inductie' },
                        { code: 'D3', title: 'Elektrische schakelingen' },
                    ]
                },
                {
                    code: 'E', title: 'Straling en materie', subdomains: [
                        { code: 'E1', title: 'Atoommodel en kwantummechanica' },
                        { code: 'E2', title: 'Kernfysica en radioactiviteit' },
                        { code: 'E3', title: 'Ioniserende straling en toepassingen' },
                    ]
                },
                {
                    code: 'F', title: 'Medische beeldvorming', subdomains: [
                        { code: 'F1', title: 'Röntgenstraling en CT-scan' },
                        { code: 'F2', title: 'Echografie (ultrageluid)' },
                        { code: 'F3', title: 'MRI en nucleaire diagnostiek' },
                    ]
                },
            ]
        }
    },
    Biologie: {
        syllabus: {
            title: 'Syllabus Biologie VWO',
            content: `
### Hoofddomeinen
- **Celbiologie:** Celstructuur, stofwisseling, enzymen.
- **Genetica en Evolutie:** DNA, eiwitsynthese, erfelijkheidswetten, evolutietheorie.
- **Zelfregulatie:** Hormoonstelsel, zenuwstelsel, afweersysteem.
- **Zelforganisatie:** Ecosystemen, populatiedynamiek, kringlopen.
`
        },
        components: {
            title: 'Examenonderdelen Biologie VWO',
            content: `
Het Centraal Examen Biologie VWO bestaat uit een mix van vraagtypen in context van een casus of bron.

### Vraagtypen
- **Kennisvragen:** Reproductie van biologische feiten.
- **Inzichtvragen:** Verbanden leggen tussen concepten.
- **Contextopgaven:** Biologische kennis toepassen op nieuwe situaties.
`
        },
        examProgram: {
            source: 'https://www.examenblad.nl/2026/vwo/vakken/exacte-vakken/biologie-vwo',
            examType: 'CE',
            domains: [
                {
                    code: 'A', title: 'Vaardigheden', subdomains: [
                        { code: 'A1', title: 'Informatievaardigheden (bronnen analyseren, Binas)' },
                        { code: 'A2', title: 'Onderzoeksvaardigheden (hypothesen, experimenten)' },
                        { code: 'A3', title: 'Wetenschappelijke en ethische discussie' },
                    ]
                },
                {
                    code: 'B', title: 'Celbiologie', subdomains: [
                        { code: 'B1', title: 'Cellen en celorganellen (prokaryoot, eukaryoot)' },
                        { code: 'B2', title: 'Stofwisseling (fotosynthese, dissimilatie, enzymen)' },
                        { code: 'B3', title: 'Membraantransport (diffusie, osmose, actief transport)' },
                        { code: 'B4', title: 'Celdeling (mitose, meiose)' },
                    ]
                },
                {
                    code: 'C', title: 'Stofwisseling van het organisme', subdomains: [
                        { code: 'C1', title: 'Voeding, vertering en transport' },
                        { code: 'C2', title: 'Gaswisseling en ademhaling' },
                        { code: 'C3', title: 'Uitscheiding en homeostase' },
                    ]
                },
                {
                    code: 'D', title: 'Zelfregulatie', subdomains: [
                        { code: 'D1', title: 'Zenuwstelsel (neuronen, reflexen, hersenen)' },
                        { code: 'D2', title: 'Hormoonstelsel (terugkoppeling, hormoonwerking)' },
                        { code: 'D3', title: 'Afweersysteem (immuniteit, vaccins, allergieën)' },
                    ]
                },
                {
                    code: 'E', title: 'Voortplanting en erfelijkheid', subdomains: [
                        { code: 'E1', title: 'DNA, genen en eiwitsynthese' },
                        { code: 'E2', title: 'Erfelijkheidswetten (Mendel, kruisingsschema\'s)' },
                        { code: 'E3', title: 'Mutaties en genetische variatie' },
                        { code: 'E4', title: 'Voortplanting (mens en plant)' },
                    ]
                },
                {
                    code: 'F', title: 'Ecologie en evolutie', subdomains: [
                        { code: 'F1', title: 'Ecosystemen en voedselketens' },
                        { code: 'F2', title: 'Populatiedynamiek en kringlopen' },
                        { code: 'F3', title: 'Biodiversiteit en duurzaamheid' },
                        { code: 'F4', title: 'Evolutietheorie (selectie, adaptatie, soortvorming)' },
                    ]
                },
            ]
        }
    },
    Economie: {
        syllabus: {
            title: 'Syllabus Economie VWO',
            content: `
### Hoofddomeinen
- **Schaarste, Ruil en Handel:** Alternatieve kosten, specialisatie.
- **Markten:** Vraag en aanbod, elasticiteit, marktvormen.
- **Ruil over de Tijd:** Sparen, lenen, investeren.
- **Welvaart en Groei:** BBP, conjunctuur, economische groei.
`
        },
        components: {
            title: 'Examenonderdelen Economie VWO',
            content: `
Het Centraal Examen Economie VWO bevat contextrijke opgaven.

### Vraagtypen
- **Berekeningsvragen:** Elasticiteiten, marktevenwicht, winst.
- **Redeneervragen:** Gevolgen van beleidswijzigingen.
- **Tekenopgaven:** Vraag- en aanbodlijnen.
`
        },
        examProgram: {
            source: 'https://www.examenblad.nl/2026/vwo/vakken/maatschappijvakken/economie-vwo',
            examType: 'CE',
            domains: [
                {
                    code: 'A', title: 'Vaardigheden', subdomains: [
                        { code: 'A1', title: 'Economische informatie analyseren en interpreteren' },
                        { code: 'A2', title: 'Economische modellen toepassen' },
                    ]
                },
                {
                    code: 'B', title: 'Concept schaarste', subdomains: [
                        { code: 'B1', title: 'Schaarste en keuzeprobleem, alternatieve kosten' },
                        { code: 'B2', title: 'Ruil en specialisatie, comparatief voordeel' },
                    ]
                },
                {
                    code: 'C', title: 'Markt', subdomains: [
                        { code: 'C1', title: 'Vraag en aanbod, marktevenwicht' },
                        { code: 'C2', title: 'Elasticiteiten (prijs, inkomen, kruis)' },
                        { code: 'C3', title: 'Marktvormen (volkomen concurrentie, monopolie, oligopolie)' },
                        { code: 'C4', title: 'Marktfalen (externe effecten, publieke goederen)' },
                    ]
                },
                {
                    code: 'D', title: 'Ruil over de tijd', subdomains: [
                        { code: 'D1', title: 'Sparen en lenen, rente en risico' },
                        { code: 'D2', title: 'Investeren en financiering' },
                    ]
                },
                {
                    code: 'E', title: 'Samenwerken en onderhandelen', subdomains: [
                        { code: 'E1', title: 'Speltheorie en strategisch gedrag' },
                        { code: 'E2', title: 'Samenwerking en conflicten' },
                    ]
                },
                {
                    code: 'F', title: 'Risico en informatie', subdomains: [
                        { code: 'F1', title: 'Onzekerheid en risicospreiding' },
                        { code: 'F2', title: 'Asymmetrische informatie (moral hazard, adverse selection)' },
                    ]
                },
                {
                    code: 'G', title: 'Welvaart en groei', subdomains: [
                        { code: 'G1', title: 'BBP, nationaal inkomen en welvaartsgroei' },
                        { code: 'G2', title: 'Conjunctuur en structuurbeleid' },
                        { code: 'G3', title: 'Inkomensverdeling en herverdeling' },
                    ]
                },
                {
                    code: 'H', title: 'Goede tijden, slechte tijden', subdomains: [
                        { code: 'H1', title: 'Conjunctuurschommelingen en bestedingen' },
                        { code: 'H2', title: 'Overheidsbeleid (fiscaal, monetair)' },
                    ]
                },
            ]
        }
    },
    Geschiedenis: {
        syllabus: {
            title: 'Syllabus Geschiedenis VWO',
            content: `
### Historische Contexten
- **De Republiek:** De Opstand en de Gouden Eeuw (1515-1648).
- **Verlichtingsideeën en de Democratische Revoluties:** (1650-1848).
- **Duitsland in Europa:** (1918-1991).
- **De Koude Oorlog:** (1945-1991).
`
        },
        components: {
            title: 'Examenonderdelen Geschiedenis VWO',
            content: `
Het Centraal Examen Geschiedenis VWO bestaat uit open vragen op historische bronnen.

### Vraagtypen
- **Bronanalyse:** Betrouwbaarheid en representativiteit.
- **Kennisvragen:** Historische gebeurtenissen en personen.
- **Contextvragen:** Plaatsen in historische context.
`
        },
        examProgram: {
            source: 'https://www.examenblad.nl/2026/vwo/vakken/maatschappijvakken/geschiedenis-vwo',
            examType: 'CE',
            domains: [
                {
                    code: 'A', title: 'Historisch besef', subdomains: [
                        { code: 'A1', title: 'Historische vragen stellen en bronnen analyseren' },
                        { code: 'A2', title: 'Continuïteit en verandering herkennen' },
                    ]
                },
                {
                    code: 'B', title: 'Oriëntatiekennis (tien tijdvakken)', subdomains: [
                        { code: 'B1', title: 'Kenmerkende aspecten per tijdvak herkennen en plaatsen' },
                        { code: 'B2', title: 'Verbanden leggen tussen tijdvakken' },
                    ]
                },
                {
                    code: 'C', title: 'Historische context: De Republiek 1515-1648', subdomains: [
                        { code: 'C1', title: 'De Opstand tegen Spanje' },
                        { code: 'C2', title: 'De Gouden Eeuw: handel, cultuur en tolerantie' },
                    ]
                },
                {
                    code: 'D', title: 'Historische context: Verlichting en revoluties 1650-1848', subdomains: [
                        { code: 'D1', title: 'Verlichtingsideeën en hun invloed' },
                        { code: 'D2', title: 'Democratische revoluties (Amerika, Frankrijk)' },
                    ]
                },
                {
                    code: 'E', title: 'Historische context: Duitsland 1918-1991', subdomains: [
                        { code: 'E1', title: 'Weimarrepubliek en opkomst nationaal-socialisme' },
                        { code: 'E2', title: 'Tweede Wereldoorlog en Holocaust' },
                        { code: 'E3', title: 'Deling en hereniging van Duitsland' },
                    ]
                },
                {
                    code: 'F', title: 'Historische context: Koude Oorlog 1945-1991', subdomains: [
                        { code: 'F1', title: 'Blokvorming en supermachten' },
                        { code: 'F2', title: 'Dekolonisatie en proxy-oorlogen' },
                        { code: 'F3', title: 'Einde Koude Oorlog' },
                    ]
                },
            ]
        }
    },
    Scheikunde: {
        syllabus: {
            title: 'Syllabus Scheikunde VWO',
            content: `
### Hoofddomeinen
- **Materie:** Atoombouw, bindingen, molecuulstructuren.
- **Reacties:** Reactiesnelheid, chemisch evenwicht, redox, zuren/basen.
- **Industriële processen:** Blokschema's, duurzaamheid.
- **Koolstofchemie:** Naamgeving, reactietypes.
`
        },
        components: {
            title: 'Examenonderdelen Scheikunde VWO',
            content: `
Het Centraal Examen Scheikunde VWO bestaat uit open vragen.

### Vraagtypen
- **Rekenopgaven:** Molrekenen, pH, evenwichtsvoorwaarden.
- **Reactievergelijkingen:** Opstellen en afmaken.
- **Uitlegvragen:** Verklaren op microniveau.
`
        },
        examProgram: {
            source: 'https://www.examenblad.nl/2026/vwo/vakken/exacte-vakken/scheikunde-vwo',
            examType: 'CE',
            domains: [
                {
                    code: 'A', title: 'Vaardigheden', subdomains: [
                        { code: 'A1', title: 'Informatievaardigheden en Binas' },
                        { code: 'A2', title: 'Onderzoeksvaardigheden' },
                        { code: 'A3', title: 'Rekenkundige vaardigheden (molrekenen, concentratie)' },
                    ]
                },
                {
                    code: 'B', title: 'Stoffen en deeltjes', subdomains: [
                        { code: 'B1', title: 'Atoombouw en periodiek systeem' },
                        { code: 'B2', title: 'Chemische bindingen (ionbinding, covalent, metaalbinding)' },
                        { code: 'B3', title: 'Molecuulstructuren en stofeigenschappen' },
                    ]
                },
                {
                    code: 'C', title: 'Chemische reacties', subdomains: [
                        { code: 'C1', title: 'Reactiesnelheid en factoren' },
                        { code: 'C2', title: 'Chemisch evenwicht (Le Chatelier, Kc)' },
                        { code: 'C3', title: 'Zuren en basen (pH, titratie, buffers)' },
                        { code: 'C4', title: 'Redoxreacties en elektrochemie' },
                    ]
                },
                {
                    code: 'D', title: 'Koolstofchemie', subdomains: [
                        { code: 'D1', title: 'Systematische naamgeving organische stoffen' },
                        { code: 'D2', title: 'Reactietypes (substitutie, additie, eliminatie)' },
                        { code: 'D3', title: 'Polymeren en biomoleculen' },
                    ]
                },
                {
                    code: 'E', title: 'Industriële chemie', subdomains: [
                        { code: 'E1', title: 'Industriële processen en blokschema\'s' },
                        { code: 'E2', title: 'Groene chemie en duurzaamheid' },
                    ]
                },
            ]
        }
    },
    Bedrijfseconomie: {
        syllabus: {
            title: 'Syllabus Bedrijfseconomie VWO',
            content: `
### Hoofddomeinen
- **Financiële zelfredzaamheid:** Persoonlijke financiële planning.
- **Onderneming en Organisatie:** Rechtsvormen, marketing, strategie.
- **Financiering:** Vermogensbehoefte, eigen en vreemd vermogen.
- **Verslaggeving:** Balans, resultatenrekening, financiële analyse.
`
        },
        components: {
            title: 'Examenonderdelen Bedrijfseconomie VWO',
            content: `
Het Centraal Examen Bedrijfseconomie VWO bevat contextrijke opgaven.

### Vraagtypen
- **Berekeningen:** Kostprijsberekeningen, balans, resultatenrekening.
- **Analyse:** Financiële gegevens en kengetallen.
- **Redeneervragen:** Bedrijfsmatige beslissingen onderbouwen.
`
        },
        examProgram: {
            source: 'https://www.examenblad.nl/2026/vwo/vakken/maatschappijvakken/bedrijfseconomie-vwo',
            examType: 'CE',
            domains: [
                {
                    code: 'A', title: 'Vaardigheden', subdomains: [
                        { code: 'A1', title: 'Bedrijfseconomische informatie verwerken' },
                        { code: 'A2', title: 'Berekeningen en analyses maken' },
                    ]
                },
                {
                    code: 'B', title: 'Financiële zelfredzaamheid', subdomains: [
                        { code: 'B1', title: 'Persoonlijke financiële planning' },
                        { code: 'B2', title: 'Financiële producten en risico' },
                    ]
                },
                {
                    code: 'C', title: 'Onderneming en omgeving', subdomains: [
                        { code: 'C1', title: 'Rechtsvormen en belanghebbenden' },
                        { code: 'C2', title: 'Marketing en marktonderzoek' },
                        { code: 'C3', title: 'Strategie en organisatie' },
                    ]
                },
                {
                    code: 'D', title: 'Financiering en investering', subdomains: [
                        { code: 'D1', title: 'Vermogensbehoefte en financieringsvormen' },
                        { code: 'D2', title: 'Investeringsselectie (NCW, TVT)' },
                    ]
                },
                {
                    code: 'E', title: 'Verslaggeving', subdomains: [
                        { code: 'E1', title: 'Balans en resultatenrekening' },
                        { code: 'E2', title: 'Kengetallen en ratio-analyse' },
                        { code: 'E3', title: 'Budgettering en liquiditeitsbegroting' },
                    ]
                },
                {
                    code: 'F', title: 'Kostprijsberekening', subdomains: [
                        { code: 'F1', title: 'Kostprijsmethoden (opslagmethode, ABC)' },
                        { code: 'F2', title: 'Break-even analyse en dekkingsbijdrage' },
                    ]
                },
            ]
        }
    },
    'Wiskunde A': {
        syllabus: {
            title: 'Syllabus Wiskunde A VWO',
            content: `
### Hoofddomeinen
- **Algebra en verbanden:** Formules, functies, grafieken en vergelijkingen.
- **Statistiek en kansrekening:** Data analyseren, kansmodellen.
- **Rijen:** Rekenkundige en meetkundige rijen.
`
        },
        components: {
            title: 'Examenonderdelen Wiskunde A VWO',
            content: `
Het Centraal Examen Wiskunde A VWO bestaat uit open vragen in contextrijke opgaven.

### Vraagtypen
- **Modelering:** Wiskundig model opstellen.
- **Berekeningen:** Algebraïsche en statistische berekeningen.
- **Redeneren:** Wiskundig onderbouwen.
`
        },
        examProgram: {
            source: 'https://www.examenblad.nl/2026/vwo/vakken/exacte-vakken/wiskunde-a-vwo',
            examType: 'CE',
            domains: [
                {
                    code: 'A', title: 'Vaardigheden', subdomains: [
                        { code: 'A1', title: 'Wiskundige vaardigheden en GR-gebruik' },
                        { code: 'A2', title: 'Modelleren en probleem oplossen' },
                    ]
                },
                {
                    code: 'B', title: 'Algebra en verbanden', subdomains: [
                        { code: 'B1', title: 'Functies en grafieken (lineair, exponentieel, logaritmisch)' },
                        { code: 'B2', title: 'Vergelijkingen en ongelijkheden' },
                        { code: 'B3', title: 'Veranderingen (afgeleide, toenamen)' },
                    ]
                },
                {
                    code: 'C', title: 'Statistiek en kansrekening', subdomains: [
                        { code: 'C1', title: 'Beschrijvende statistiek (centrummaten, spreidingsmaten)' },
                        { code: 'C2', title: 'Kansrekening en kansverdelingen' },
                        { code: 'C3', title: 'Toetsingstheorie (hypothesetoetsen, betrouwbaarheidsintervallen)' },
                    ]
                },
                {
                    code: 'D', title: 'Discrete analyse', subdomains: [
                        { code: 'D1', title: 'Rekenkundige en meetkundige rijen' },
                        { code: 'D2', title: 'Financiële berekeningen' },
                    ]
                },
            ]
        }
    },
    'Wiskunde B': {
        syllabus: {
            title: 'Syllabus Wiskunde B VWO',
            content: `
### Hoofddomeinen
- **Algebra en getallen:** Machten, logaritmen.
- **Analyse:** Differentiëren, integreren, functies en grafieken.
- **Meetkunde:** Goniometrie, analytische meetkunde, vectoren.
`
        },
        components: {
            title: 'Examenonderdelen Wiskunde B VWO',
            content: `
Het Centraal Examen Wiskunde B VWO richt zich op abstracte wiskunde.

### Vraagtypen
- **Exacte berekeningen:** Algebraïsche oplossingen zonder rekenmachine.
- **Bewijsvragen:** Formeel wiskundig bewijs.
- **Analyse en meetkunde:** Calculus en meetkundige principes.
`
        },
        examProgram: {
            source: 'https://www.examenblad.nl/2026/vwo/vakken/exacte-vakken/wiskunde-b-vwo',
            examType: 'CE',
            domains: [
                {
                    code: 'A', title: 'Vaardigheden', subdomains: [
                        { code: 'A1', title: 'Wiskundige vaardigheden en formaliseren' },
                        { code: 'A2', title: 'Bewijzen en exact redeneren' },
                    ]
                },
                {
                    code: 'B', title: 'Algebra', subdomains: [
                        { code: 'B1', title: 'Algebraïsche vaardigheden (machten, wortels, logaritmen)' },
                        { code: 'B2', title: 'Vergelijkingen en ongelijkheden oplossen' },
                    ]
                },
                {
                    code: 'C', title: 'Analyse', subdomains: [
                        { code: 'C1', title: 'Functies en grafieken' },
                        { code: 'C2', title: 'Differentiëren (kettingregel, productregel, quotiëntregel)' },
                        { code: 'C3', title: 'Integreren (primitieve functies, oppervlakte, inhoud)' },
                        { code: 'C4', title: 'Differentiaalvergelijkingen' },
                    ]
                },
                {
                    code: 'D', title: 'Analytische meetkunde', subdomains: [
                        { code: 'D1', title: 'Vectoren en coördinaatmeetkunde' },
                        { code: 'D2', title: 'Lijnen en cirkels' },
                        { code: 'D3', title: 'Goniometrie (sin, cos, tan en identiteiten)' },
                    ]
                },
            ]
        }
    },
    Frans: {
        syllabus: {
            title: 'Syllabus Frans VWO',
            content: `
### Domein A: Leesvaardigheid
- **Tekstbegrip:** Authentieke Franse teksten op C1-niveau.
- **Tekstsoorten:** Nieuwsartikelen, recensies, opiniestukken.
- **Woordenschat en idioom.**
`
        },
        components: {
            title: 'Examenonderdelen Frans VWO',
            content: `
Het Centraal Examen Frans VWO is volledig gericht op leesvaardigheid.

### Teksten met vragen
- **Weging:** 100% van de totale score.
- **Vraagtypen:** Grotendeels meerkeuzevragen.
`
        },
        examProgram: {
            source: 'https://www.examenblad.nl/2026/vwo/vakken/talen/frans-vwo',
            examType: 'CE',
            domains: [
                {
                    code: 'A', title: 'Leesvaardigheid', subdomains: [
                        { code: 'A1', title: 'Lezen van informatieve en persuasieve Franse teksten' },
                        { code: 'A2', title: 'Woordenschat en idioom op C1-niveau' },
                        { code: 'A3', title: 'Tekststructuur en argumentatie herkennen' },
                    ]
                },
                { code: 'B', title: 'Luistervaardigheid', description: 'Alleen schoolexamen' },
                { code: 'C', title: 'Gespreksvaardigheid', description: 'Alleen schoolexamen' },
                { code: 'D', title: 'Schrijfvaardigheid', description: 'Alleen schoolexamen' },
            ]
        }
    },
    Duits: {
        syllabus: {
            title: 'Syllabus Duits VWO',
            content: `
### Domein A: Leesvaardigheid
- **Tekstbegrip:** Authentieke Duitse teksten op C1-niveau.
- **Tekstsoorten:** Nieuwsartikelen, recensies, opiniestukken.
- **Woordenschat en grammatica.**
`
        },
        components: {
            title: 'Examenonderdelen Duits VWO',
            content: `
Het Centraal Examen Duits VWO is volledig gericht op leesvaardigheid.

### Teksten met vragen
- **Weging:** 100% van de totale score.
- **Vraagtypen:** Grotendeels meerkeuzevragen.
`
        },
        examProgram: {
            source: 'https://www.examenblad.nl/2026/vwo/vakken/talen/duits-vwo',
            examType: 'CE',
            domains: [
                {
                    code: 'A', title: 'Leesvaardigheid', subdomains: [
                        { code: 'A1', title: 'Lezen van informatieve en persuasieve Duitse teksten' },
                        { code: 'A2', title: 'Woordenschat, idioom en grammaticale structuren' },
                        { code: 'A3', title: 'Tekststructuur en signaalwoorden herkennen' },
                    ]
                },
                { code: 'B', title: 'Luistervaardigheid', description: 'Alleen schoolexamen' },
                { code: 'C', title: 'Gespreksvaardigheid', description: 'Alleen schoolexamen' },
                { code: 'D', title: 'Schrijfvaardigheid', description: 'Alleen schoolexamen' },
            ]
        }
    },

    // ==========================================
    // HAVO EXAMENPROGRAMMA'S
    // ==========================================
    'HAVO_Nederlands': {
        syllabus: { title: 'Syllabus Nederlands HAVO', content: 'Leesvaardigheid, schrijfvaardigheid en argumentatie op HAVO-niveau.' },
        components: { title: 'Examenonderdelen Nederlands HAVO', content: 'CE: Leesvaardigheid en Argumentatie.' },
        examProgram: {
            source: 'https://www.examenblad.nl/2026/havo/vakken/talen/nederlands-havo',
            examType: 'CE',
            domains: [
                {
                    code: 'A', title: 'Leesvaardigheid', subdomains: [
                        { code: 'A1', title: 'Analyseren en interpreteren van teksten' },
                        { code: 'A2', title: 'Beoordelen van teksten op betrouwbaarheid' },
                        { code: 'A3', title: 'Samenvatten van teksten' },
                    ]
                },
                {
                    code: 'B', title: 'Argumentatieve vaardigheden', subdomains: [
                        { code: 'B1', title: 'Herkennen van argumentatieschema\'s' },
                        { code: 'B2', title: 'Beoordelen van argumentatie' },
                    ]
                },
                { code: 'C', title: 'Schrijfvaardigheid', description: 'Alleen schoolexamen' },
            ]
        }
    },
    'HAVO_Engels': {
        syllabus: { title: 'Syllabus Engels HAVO', content: 'Leesvaardigheid Engels op HAVO-niveau.' },
        components: { title: 'Examenonderdelen Engels HAVO', content: 'CE: Leesvaardigheid.' },
        examProgram: {
            source: 'https://www.examenblad.nl/2026/havo/vakken/talen/engels-havo',
            examType: 'CE',
            domains: [
                {
                    code: 'A', title: 'Leesvaardigheid', subdomains: [
                        { code: 'A1', title: 'Lezen van zakelijke en informatieve teksten' },
                        { code: 'A2', title: 'Woordenschat en idioom in context' },
                    ]
                },
                { code: 'B', title: 'Luister- en kijkvaardigheid', description: 'Alleen schoolexamen' },
            ]
        }
    },
    'HAVO_Wiskunde A': {
        syllabus: { title: 'Syllabus Wiskunde A HAVO', content: 'Statistiek, kansrekening en analyse op HAVO-niveau.' },
        components: { title: 'Examenonderdelen Wiskunde A HAVO', content: 'CE: Alle domeinen.' },
        examProgram: {
            source: 'https://www.examenblad.nl/2026/havo/vakken/wiskunde/wiskunde-a-havo',
            examType: 'CE',
            domains: [
                {
                    code: 'A', title: 'Vaardigheden', subdomains: [
                        { code: 'A1', title: 'Algebraïsche vaardigheden' },
                        { code: 'A2', title: 'Functieonderzoek' },
                    ]
                },
                {
                    code: 'B', title: 'Statistiek en kansrekening', subdomains: [
                        { code: 'B1', title: 'Beschrijvende statistiek' },
                        { code: 'B2', title: 'Kansrekening' },
                        { code: 'B3', title: 'Verdelingen' },
                    ]
                },
                {
                    code: 'C', title: 'Functies en grafieken', subdomains: [
                        { code: 'C1', title: 'Standaardfuncties' },
                        { code: 'C2', title: 'Afgeleide functies' },
                    ]
                },
            ]
        }
    },
    'HAVO_Wiskunde B': {
        syllabus: { title: 'Syllabus Wiskunde B HAVO', content: 'Analyse, meetkunde en goniometrie op HAVO-niveau.' },
        components: { title: 'Examenonderdelen Wiskunde B HAVO', content: 'CE: Alle domeinen.' },
        examProgram: {
            source: 'https://www.examenblad.nl/2026/havo/vakken/wiskunde/wiskunde-b-havo',
            examType: 'CE',
            domains: [
                {
                    code: 'A', title: 'Vaardigheden', subdomains: [
                        { code: 'A1', title: 'Algebraïsche vaardigheden' },
                        { code: 'A2', title: 'Rekenregels en formules' },
                    ]
                },
                {
                    code: 'B', title: 'Functies en grafieken', subdomains: [
                        { code: 'B1', title: 'Standaardfuncties' },
                        { code: 'B2', title: 'Transformaties' },
                    ]
                },
                {
                    code: 'C', title: 'Differentiaalrekening', subdomains: [
                        { code: 'C1', title: 'Afgeleide functies' },
                        { code: 'C2', title: 'Toepassingen differentiaalrekening' },
                    ]
                },
                {
                    code: 'D', title: 'Goniometrie', subdomains: [
                        { code: 'D1', title: 'Goniometrische functies' },
                        { code: 'D2', title: 'Goniometrische vergelijkingen' },
                    ]
                },
            ]
        }
    },
    'HAVO_Natuurkunde': {
        syllabus: { title: 'Syllabus Natuurkunde HAVO', content: 'Mechanica, elektriciteit, golven en straling op HAVO-niveau.' },
        components: { title: 'Examenonderdelen Natuurkunde HAVO', content: 'CE: Domeinen B t/m E.' },
        examProgram: {
            source: 'https://www.examenblad.nl/2026/havo/vakken/natuur/natuurkunde-havo',
            examType: 'CE',
            domains: [
                {
                    code: 'A', title: 'Vaardigheden', subdomains: [
                        { code: 'A1', title: 'Onderzoeksvaardigheden' },
                        { code: 'A2', title: 'Rekenvaardigheden en formules' },
                    ]
                },
                {
                    code: 'B', title: 'Krachtenleer en beweging', subdomains: [
                        { code: 'B1', title: 'Krachten en evenwicht' },
                        { code: 'B2', title: 'Eenparige en versnelde beweging' },
                    ]
                },
                {
                    code: 'C', title: 'Elektriciteit', subdomains: [
                        { code: 'C1', title: 'Elektrische schakelingen' },
                        { code: 'C2', title: 'Energie en vermogen' },
                    ]
                },
                {
                    code: 'D', title: 'Golven en straling', subdomains: [
                        { code: 'D1', title: 'Trillingen en golven' },
                        { code: 'D2', title: 'Elektromagnetische straling' },
                    ]
                },
                {
                    code: 'E', title: 'Warmteleer', subdomains: [
                        { code: 'E1', title: 'Temperatuur en warmte' },
                        { code: 'E2', title: 'Faseovergangen' },
                    ]
                },
            ]
        }
    },
    'HAVO_Scheikunde': {
        syllabus: { title: 'Syllabus Scheikunde HAVO', content: 'Stoffen, reacties en berekeningen op HAVO-niveau.' },
        components: { title: 'Examenonderdelen Scheikunde HAVO', content: 'CE: Domeinen B t/m E.' },
        examProgram: {
            source: 'https://www.examenblad.nl/2026/havo/vakken/natuur/scheikunde-havo',
            examType: 'CE',
            domains: [
                {
                    code: 'A', title: 'Vaardigheden', subdomains: [
                        { code: 'A1', title: 'Onderzoeksvaardigheden' },
                    ]
                },
                {
                    code: 'B', title: 'Stoffen en deeltjes', subdomains: [
                        { code: 'B1', title: 'Atoombouw en periodiek systeem' },
                        { code: 'B2', title: 'Chemische binding' },
                    ]
                },
                {
                    code: 'C', title: 'Chemische reacties', subdomains: [
                        { code: 'C1', title: 'Reactievergelijkingen' },
                        { code: 'C2', title: 'Zuren en basen' },
                        { code: 'C3', title: 'Redoxreacties' },
                    ]
                },
                {
                    code: 'D', title: 'Berekeningen', subdomains: [
                        { code: 'D1', title: 'Molberekeningen' },
                        { code: 'D2', title: 'Concentratie en volume' },
                    ]
                },
            ]
        }
    },
    'HAVO_Biologie': {
        syllabus: { title: 'Syllabus Biologie HAVO', content: 'Celbiologie, ecologie, voortplanting en gezondheid op HAVO-niveau.' },
        components: { title: 'Examenonderdelen Biologie HAVO', content: 'CE: Domeinen B t/m F.' },
        examProgram: {
            source: 'https://www.examenblad.nl/2026/havo/vakken/natuur/biologie-havo',
            examType: 'CE',
            domains: [
                {
                    code: 'A', title: 'Vaardigheden', subdomains: [
                        { code: 'A1', title: 'Onderzoeksvaardigheden' },
                    ]
                },
                {
                    code: 'B', title: 'Celbiologie', subdomains: [
                        { code: 'B1', title: 'Cellen en celprocessen' },
                        { code: 'B2', title: 'Stofwisseling' },
                    ]
                },
                {
                    code: 'C', title: 'Voortplanting', subdomains: [
                        { code: 'C1', title: 'Voortplanting bij de mens' },
                        { code: 'C2', title: 'Erfelijkheid en DNA' },
                    ]
                },
                {
                    code: 'D', title: 'Ecologie', subdomains: [
                        { code: 'D1', title: 'Ecosystemen' },
                        { code: 'D2', title: 'Energiestroom en kringlopen' },
                    ]
                },
                {
                    code: 'E', title: 'Regulatie', subdomains: [
                        { code: 'E1', title: 'Hormonale regulatie' },
                        { code: 'E2', title: 'Zenuwstelsel' },
                    ]
                },
            ]
        }
    },
    'HAVO_Economie': {
        syllabus: { title: 'Syllabus Economie HAVO', content: 'Markt, overheid, internationale handel op HAVO-niveau.' },
        components: { title: 'Examenonderdelen Economie HAVO', content: 'CE: Alle domeinen.' },
        examProgram: {
            source: 'https://www.examenblad.nl/2026/havo/vakken/economie/economie-havo',
            examType: 'CE',
            domains: [
                {
                    code: 'A', title: 'Vaardigheden', subdomains: [
                        { code: 'A1', title: 'Economisch denken' },
                    ]
                },
                {
                    code: 'B', title: 'Markt', subdomains: [
                        { code: 'B1', title: 'Vraag en aanbod' },
                        { code: 'B2', title: 'Marktvormen' },
                    ]
                },
                {
                    code: 'C', title: 'Overheid', subdomains: [
                        { code: 'C1', title: 'Overheidsbeleid' },
                        { code: 'C2', title: 'Sociale zekerheid' },
                    ]
                },
                {
                    code: 'D', title: 'Internationaal', subdomains: [
                        { code: 'D1', title: 'Internationale handel' },
                        { code: 'D2', title: 'Wisselkoersen' },
                    ]
                },
            ]
        }
    },
    'HAVO_Geschiedenis': {
        syllabus: { title: 'Syllabus Geschiedenis HAVO', content: 'Historisch denken en contexten op HAVO-niveau.' },
        components: { title: 'Examenonderdelen Geschiedenis HAVO', content: 'CE: Historische contexten.' },
        examProgram: {
            source: 'https://www.examenblad.nl/2026/havo/vakken/maatschappij/geschiedenis-havo',
            examType: 'CE',
            domains: [
                {
                    code: 'A', title: 'Historisch besef', subdomains: [
                        { code: 'A1', title: 'Historische denk- en werkwijzen' },
                    ]
                },
                {
                    code: 'B', title: 'Oriëntatiekennis', subdomains: [
                        { code: 'B1', title: 'Tien tijdvakken' },
                    ]
                },
                {
                    code: 'C', title: 'Historische contexten', subdomains: [
                        { code: 'C1', title: 'Republiek der Nederlanden (1515-1648)' },
                        { code: 'C2', title: 'Verlichtingsideeën en de Franse Revolutie' },
                        { code: 'C3', title: 'Duitsland 1871-1945' },
                    ]
                },
            ]
        }
    },

    // ==========================================
    // VMBO-GT EXAMENPROGRAMMA'S
    // ==========================================
    'VMBO_Nederlands': {
        syllabus: { title: 'Syllabus Nederlands VMBO-GT', content: 'Leesvaardigheid op VMBO-GT niveau.' },
        components: { title: 'Examenonderdelen Nederlands VMBO-GT', content: 'CE: Leesvaardigheid.' },
        examProgram: {
            source: 'https://www.examenblad.nl/2026/vmbo-gt/vakken/talen/nederlands-vmbo-gt',
            examType: 'CE',
            domains: [
                {
                    code: 'A', title: 'Leesvaardigheid', subdomains: [
                        { code: 'A1', title: 'Zakelijke en informatieve teksten lezen' },
                        { code: 'A2', title: 'Hoofdgedachte en tekststructuur herkennen' },
                        { code: 'A3', title: 'Woordbetekenissen in context' },
                    ]
                },
                { code: 'B', title: 'Schrijfvaardigheid', description: 'Alleen schoolexamen' },
            ]
        }
    },
    'VMBO_Engels': {
        syllabus: { title: 'Syllabus Engels VMBO-GT', content: 'Leesvaardigheid Engels op VMBO-GT niveau.' },
        components: { title: 'Examenonderdelen Engels VMBO-GT', content: 'CE: Leesvaardigheid.' },
        examProgram: {
            source: 'https://www.examenblad.nl/2026/vmbo-gt/vakken/talen/engels-vmbo-gt',
            examType: 'CE',
            domains: [
                {
                    code: 'A', title: 'Leesvaardigheid', subdomains: [
                        { code: 'A1', title: 'Korte informatieve teksten lezen' },
                        { code: 'A2', title: 'Woordenschat en uitdrukkingen' },
                    ]
                },
                { code: 'B', title: 'Luistervaardigheid', description: 'Alleen schoolexamen' },
            ]
        }
    },
    'VMBO_Wiskunde': {
        syllabus: { title: 'Syllabus Wiskunde VMBO-GT', content: 'Getallen, verhoudingen, meetkunde en verbanden op VMBO-GT niveau.' },
        components: { title: 'Examenonderdelen Wiskunde VMBO-GT', content: 'CE: Alle domeinen.' },
        examProgram: {
            source: 'https://www.examenblad.nl/2026/vmbo-gt/vakken/wiskunde/wiskunde-vmbo-gt',
            examType: 'CE',
            domains: [
                {
                    code: 'A', title: 'Getallen en bewerkingen', subdomains: [
                        { code: 'A1', title: 'Rekenen met gehele getallen, breuken en decimalen' },
                        { code: 'A2', title: 'Verhoudingen en procenten' },
                    ]
                },
                {
                    code: 'B', title: 'Meetkunde', subdomains: [
                        { code: 'B1', title: 'Vlakke figuren en ruimtelijke vormen' },
                        { code: 'B2', title: 'Oppervlakte en inhoud berekenen' },
                        { code: 'B3', title: 'Pythagoras en goniometrie' },
                    ]
                },
                {
                    code: 'C', title: 'Verbanden', subdomains: [
                        { code: 'C1', title: 'Lineaire en exponentiële verbanden' },
                        { code: 'C2', title: 'Grafieken lezen en interpreteren' },
                    ]
                },
                {
                    code: 'D', title: 'Statistiek', subdomains: [
                        { code: 'D1', title: 'Tabellen en diagrammen' },
                        { code: 'D2', title: 'Gemiddelde, mediaan en modus' },
                    ]
                },
            ]
        }
    },
    'VMBO_Nask 1': {
        syllabus: { title: 'Syllabus Nask 1 VMBO-GT', content: 'Natuurkunde-gedeelte: krachten, elektriciteit, licht en geluid.' },
        components: { title: 'Examenonderdelen Nask 1 VMBO-GT', content: 'CE: Alle domeinen.' },
        examProgram: {
            source: 'https://www.examenblad.nl/2026/vmbo-gt/vakken/natuur/nask1-vmbo-gt',
            examType: 'CE',
            domains: [
                {
                    code: 'A', title: 'Vaardigheden', subdomains: [
                        { code: 'A1', title: 'Onderzoek doen en meten' },
                    ]
                },
                {
                    code: 'B', title: 'Krachten en beweging', subdomains: [
                        { code: 'B1', title: 'Krachten herkennen en tekenen' },
                        { code: 'B2', title: 'Snelheid en versnelling' },
                    ]
                },
                {
                    code: 'C', title: 'Elektriciteit', subdomains: [
                        { code: 'C1', title: 'Stroomkringen en schakelingen' },
                        { code: 'C2', title: 'Spanning, stroom en weerstand' },
                    ]
                },
                {
                    code: 'D', title: 'Licht en geluid', subdomains: [
                        { code: 'D1', title: 'Lichtbreking en spiegels' },
                        { code: 'D2', title: 'Geluid en trillingen' },
                    ]
                },
                {
                    code: 'E', title: 'Warmte en energie', subdomains: [
                        { code: 'E1', title: 'Warmte en temperatuur' },
                        { code: 'E2', title: 'Energieomzettingen' },
                    ]
                },
            ]
        }
    },
    'VMBO_Nask 2': {
        syllabus: { title: 'Syllabus Nask 2 VMBO-GT', content: 'Scheikunde-gedeelte: stoffen, reacties en materialen.' },
        components: { title: 'Examenonderdelen Nask 2 VMBO-GT', content: 'CE: Alle domeinen.' },
        examProgram: {
            source: 'https://www.examenblad.nl/2026/vmbo-gt/vakken/natuur/nask2-vmbo-gt',
            examType: 'CE',
            domains: [
                {
                    code: 'A', title: 'Vaardigheden', subdomains: [
                        { code: 'A1', title: 'Onderzoek doen en veiligheid' },
                    ]
                },
                {
                    code: 'B', title: 'Stoffen en materialen', subdomains: [
                        { code: 'B1', title: 'Zuivere stoffen en mengsels' },
                        { code: 'B2', title: 'Atomen en moleculen' },
                    ]
                },
                {
                    code: 'C', title: 'Chemische reacties', subdomains: [
                        { code: 'C1', title: 'Reactievergelijkingen opstellen' },
                        { code: 'C2', title: 'Verbranding en oxidatie' },
                    ]
                },
                {
                    code: 'D', title: 'Zuren en basen', subdomains: [
                        { code: 'D1', title: 'pH en indicatoren' },
                        { code: 'D2', title: 'Neutralisatie' },
                    ]
                },
            ]
        }
    },
    'VMBO_Biologie': {
        syllabus: { title: 'Syllabus Biologie VMBO-GT', content: 'Mens en gezondheid, ecologie, voortplanting.' },
        components: { title: 'Examenonderdelen Biologie VMBO-GT', content: 'CE: Alle domeinen.' },
        examProgram: {
            source: 'https://www.examenblad.nl/2026/vmbo-gt/vakken/natuur/biologie-vmbo-gt',
            examType: 'CE',
            domains: [
                {
                    code: 'A', title: 'Vaardigheden', subdomains: [
                        { code: 'A1', title: 'Biologisch onderzoek' },
                    ]
                },
                {
                    code: 'B', title: 'Mens en gezondheid', subdomains: [
                        { code: 'B1', title: 'Voeding en vertering' },
                        { code: 'B2', title: 'Hart, bloed en longen' },
                        { code: 'B3', title: 'Zintuigen en zenuwstelsel' },
                    ]
                },
                {
                    code: 'C', title: 'Voortplanting en erfelijkheid', subdomains: [
                        { code: 'C1', title: 'Voortplanting bij mens en dier' },
                        { code: 'C2', title: 'Erfelijkheid basis' },
                    ]
                },
                {
                    code: 'D', title: 'Ecologie', subdomains: [
                        { code: 'D1', title: 'Leefomgeving en voedselketens' },
                        { code: 'D2', title: 'Milieu en duurzaamheid' },
                    ]
                },
            ]
        }
    },
    'VMBO_Economie': {
        syllabus: { title: 'Syllabus Economie VMBO-GT', content: 'Consumeren, produceren en overheid op VMBO-GT niveau.' },
        components: { title: 'Examenonderdelen Economie VMBO-GT', content: 'CE: Alle domeinen.' },
        examProgram: {
            source: 'https://www.examenblad.nl/2026/vmbo-gt/vakken/economie/economie-vmbo-gt',
            examType: 'CE',
            domains: [
                {
                    code: 'A', title: 'Vaardigheden', subdomains: [
                        { code: 'A1', title: 'Economisch redeneren' },
                    ]
                },
                {
                    code: 'B', title: 'Consumeren', subdomains: [
                        { code: 'B1', title: 'Behoeften en budget' },
                        { code: 'B2', title: 'Consumentenrecht' },
                    ]
                },
                {
                    code: 'C', title: 'Produceren', subdomains: [
                        { code: 'C1', title: 'Ondernemingsvormen' },
                        { code: 'C2', title: 'Kosten en winst' },
                    ]
                },
                {
                    code: 'D', title: 'Overheid en bestuur', subdomains: [
                        { code: 'D1', title: 'Belastingen en sociale zekerheid' },
                        { code: 'D2', title: 'Overheidsfinanciën' },
                    ]
                },
            ]
        }
    },
    'VMBO_Geschiedenis': {
        syllabus: { title: 'Syllabus Geschiedenis VMBO-GT', content: 'Historisch redeneren en thematische eenheden.' },
        components: { title: 'Examenonderdelen Geschiedenis VMBO-GT', content: 'CE: Thematische eenheden.' },
        examProgram: {
            source: 'https://www.examenblad.nl/2026/vmbo-gt/vakken/maatschappij/geschiedenis-vmbo-gt',
            examType: 'CE',
            domains: [
                {
                    code: 'A', title: 'Historisch denken', subdomains: [
                        { code: 'A1', title: 'Tijdvakken en kenmerkende aspecten' },
                    ]
                },
                {
                    code: 'B', title: 'Staatsinrichting', subdomains: [
                        { code: 'B1', title: 'Democratie en rechtsstaat' },
                    ]
                },
                {
                    code: 'C', title: 'De Tweede Wereldoorlog', subdomains: [
                        { code: 'C1', title: 'Opkomst fascisme en nationaalsocialisme' },
                        { code: 'C2', title: 'Nederland in oorlogstijd' },
                    ]
                },
                {
                    code: 'D', title: 'De Koude Oorlog', subdomains: [
                        { code: 'D1', title: 'Oost-West tegenstelling' },
                        { code: 'D2', title: 'Gevolgen voor Nederland' },
                    ]
                },
            ]
        }
    },
    'VMBO_Aardrijkskunde': {
        syllabus: { title: 'Syllabus Aardrijkskunde VMBO-GT', content: 'Weer en klimaat, bevolking, arm en rijk, aarde.' },
        components: { title: 'Examenonderdelen Aardrijkskunde VMBO-GT', content: 'CE: Alle domeinen.' },
        examProgram: {
            source: 'https://www.examenblad.nl/2026/vmbo-gt/vakken/maatschappij/aardrijkskunde-vmbo-gt',
            examType: 'CE',
            domains: [
                {
                    code: 'A', title: 'Vaardigheden', subdomains: [
                        { code: 'A1', title: 'Kaartlezen en topografie' },
                    ]
                },
                {
                    code: 'B', title: 'Weer en klimaat', subdomains: [
                        { code: 'B1', title: 'Klimaatzones en weersverschijnselen' },
                        { code: 'B2', title: 'Klimaatverandering' },
                    ]
                },
                {
                    code: 'C', title: 'Bevolking en ruimte', subdomains: [
                        { code: 'C1', title: 'Bevolkingsgroei en migratie' },
                        { code: 'C2', title: 'Verstedelijking' },
                    ]
                },
                {
                    code: 'D', title: 'Arm en rijk', subdomains: [
                        { code: 'D1', title: 'Ontwikkelingslanden en globalisering' },
                    ]
                },
                {
                    code: 'E', title: 'De aarde', subdomains: [
                        { code: 'E1', title: 'Tektoniek en vulkanisme' },
                        { code: 'E2', title: 'Landschapsvormen' },
                    ]
                },
            ]
        }
    },
    'VMBO_Maatschappijkunde': {
        syllabus: { title: 'Syllabus Maatschappijkunde VMBO-GT', content: 'Samenleving, cultuur, rechtsstaat en politiek.' },
        components: { title: 'Examenonderdelen Maatschappijkunde VMBO-GT', content: 'CE: Alle domeinen.' },
        examProgram: {
            source: 'https://www.examenblad.nl/2026/vmbo-gt/vakken/maatschappij/maatschappijkunde-vmbo-gt',
            examType: 'CE',
            domains: [
                {
                    code: 'A', title: 'Vaardigheden', subdomains: [
                        { code: 'A1', title: 'Maatschappelijke vraagstukken analyseren' },
                    ]
                },
                {
                    code: 'B', title: 'Cultuur en socialisatie', subdomains: [
                        { code: 'B1', title: 'Normen, waarden en cultuurverschillen' },
                        { code: 'B2', title: 'Socialisatie en identiteit' },
                    ]
                },
                {
                    code: 'C', title: 'Rechtsstaat', subdomains: [
                        { code: 'C1', title: 'Grondrechten en rechtspleging' },
                    ]
                },
                {
                    code: 'D', title: 'Parlementaire democratie', subdomains: [
                        { code: 'D1', title: 'Politieke partijen en verkiezingen' },
                        { code: 'D2', title: 'Overheid en beleid' },
                    ]
                },
            ]
        }
    },
    'VMBO_Duits': {
        syllabus: { title: 'Syllabus Duits VMBO-GT', content: 'Leesvaardigheid Duits op VMBO-GT niveau.' },
        components: { title: 'Examenonderdelen Duits VMBO-GT', content: 'CE: Leesvaardigheid.' },
        examProgram: {
            source: 'https://www.examenblad.nl/2026/vmbo-gt/vakken/talen/duits-vmbo-gt',
            examType: 'CE',
            domains: [
                {
                    code: 'A', title: 'Leesvaardigheid', subdomains: [
                        { code: 'A1', title: 'Korte teksten lezen en begrijpen' },
                        { code: 'A2', title: 'Woordenschat en grammaticale structuren' },
                    ]
                },
                { code: 'B', title: 'Luistervaardigheid', description: 'Alleen schoolexamen' },
                { code: 'C', title: 'Gespreksvaardigheid', description: 'Alleen schoolexamen' },
            ]
        }
    },
};

/**
 * Helper: geeft de CE-relevante domeinen voor een vak (filtert SE-only domeinen uit)
 * @param subject - vaknaam
 * @param level - optioneel examenniveau (VMBO/HAVO/VWO), default VWO
 */
export const getCEDomains = (subject: string, level?: string): ExamDomain[] => {
    // Try level-specific key first, fall back to base subject (VWO)
    const levelKey = level && level !== 'VWO' ? `${level}_${subject}` : subject;
    const program = examInfo[levelKey]?.examProgram || examInfo[subject]?.examProgram;
    if (!program) return [];
    return program.domains.filter(d => !d.description?.includes('Alleen schoolexamen'));
};

/**
 * Helper: maakt een samenvatting van het examenprogramma voor Gemini prompts
 * @param subject - vaknaam
 * @param level - optioneel examenniveau (VMBO/HAVO/VWO), default VWO
 */
export const getExamProgramSummary = (subject: string, level?: string): string => {
    const ceDomains = getCEDomains(subject, level);
    if (ceDomains.length === 0) return '';

    return ceDomains.map(domain => {
        const subs = domain.subdomains?.map(s => `  - ${s.code}: ${s.title}`).join('\n') || '';
        return `Domein ${domain.code}: ${domain.title}\n${subs}`;
    }).join('\n\n');
};
