// Client de départ et ses 20 posts (chargés au premier lancement).
export default {
  "client": {
    "name": "Client BTP (à renommer)",
    "company": "[Nom de l'entreprise]",
    "sector": "Intégration de solutions digitales pour les entreprises du BTP",
    "offer": "Choisir, déployer et connecter les outils numériques des entreprises du BTP (logiciel de chantier, devis/facturation, ERP, pointage, GED) pour supprimer la double saisie et piloter la marge chantier par chantier.",
    "audience": "Dirigeants de PME et ETI du BTP (gros œuvre, second œuvre, TP), DAF, directeurs travaux, conducteurs de travaux.",
    "tone": "Direct, concret, terrain. Phrases courtes. Tutoiement interdit, vouvoiement implicite. Pas de jargon IT : on parle chantier, marge, devis, compagnons. Un peu d'humour, jamais condescendant envers les gens du terrain.",
    "themes": "1. Le coût caché de la double saisie et des outils qui ne se parlent pas\n2. Adoption terrain : un outil que les équipes n'utilisent pas ne sert à rien\n3. Méthode d'intégration et erreurs à éviter\n4. Pilotage de la marge et données chantier\n5. Réglementation (facture électronique) et coulisses du métier",
    "dos": "Exemples concrets de chantier, listes courtes, une idée par post, finir par une question ou un appel à échanger.",
    "donts": "Chiffres inventés, promesses miracles, critiquer nommément un éditeur de logiciel, jargon (API, middleware…) sans l'expliquer."
  },
  "posts": [
    {
      "scheduledAt": "2026-11-09T08:30:00+01:00",
      "theme": "Double saisie",
      "format": "Texte + image",
      "visualIdea": "Photo d'un chef de chantier dans une cabane de chantier, au bureau, entouré de papiers et d'un ordinateur portable. Lumière de fin de journée.",
      "text": "Votre chef de chantier n'est pas payé pour faire de la saisie.\n\nPourtant, regardez sa fin de journée :\n\n→ Il note les heures sur papier.\n→ Il les ressaisit dans un tableur.\n→ L'assistante les ressaisit dans la paie.\n→ Le comptable les ressaisit pour la facturation.\n\nQuatre fois la même information.\nQuatre occasions de se tromper.\n\nLe problème, ce n'est pas vos équipes.\nCe n'est même pas vos logiciels.\n\nC'est qu'ils ne se parlent pas.\n\nMon métier, c'est de les faire se parler.\nPour qu'une info saisie une fois sur le chantier arrive partout où elle doit aller.\n\nCombien de fois la même donnée est-elle ressaisie dans votre entreprise ?"
    },
    {
      "scheduledAt": "2026-11-10T08:30:00+01:00",
      "theme": "Diagnostic",
      "format": "Liste",
      "visualIdea": "Carrousel ou visuel simple : « 5 signes » en grands chiffres, fond sombre, accent jaune chantier.",
      "text": "5 signes que vos outils vous coûtent plus qu'ils ne vous rapportent :\n\n1. Vous découvrez la marge réelle d'un chantier… 3 mois après la réception.\n\n2. « Il est où le dernier plan ? » est la phrase la plus prononcée de la semaine.\n\n3. Vos devis et vos factures vivent dans deux logiciels différents.\n\n4. Le jour où votre assistante est en congé, plus personne ne sait sortir un état des heures.\n\n5. Vous avez acheté un logiciel il y a 2 ans. Il sert surtout à… rien.\n\nSi vous en cochez 2 ou plus, ce n'est pas un problème de logiciel.\nC'est un problème d'intégration.\n\nVous en cochez combien ?"
    },
    {
      "scheduledAt": "2026-11-11T08:30:00+01:00",
      "theme": "Idée reçue",
      "format": "Texte",
      "visualIdea": "",
      "text": "« Le digital, c'est pour les grosses boîtes. »\n\nJe l'entends toutes les semaines.\nEt c'est exactement l'inverse.\n\nUn grand groupe a une DSI, des chefs de projet, des process écrits.\nIl peut absorber une heure perdue par-ci, une erreur de facturation par-là.\n\nUne PME de 25 personnes, non.\n\nQuand votre conducteur de travaux passe sa soirée à refaire un planning, c'est du temps qu'il ne passe pas sur le chantier.\nQuand un avenant n'est pas facturé, c'est directement votre marge qui part.\n\nPlus l'entreprise est petite, plus chaque heure compte.\nEt plus des outils bien connectés font la différence.\n\nLa bonne question n'est pas « est-ce qu'on est assez gros ? »\nC'est « combien ça nous coûte de ne rien changer ? »"
    },
    {
      "scheduledAt": "2026-11-12T08:30:00+01:00",
      "theme": "Erreur à éviter",
      "format": "Texte",
      "visualIdea": "",
      "text": "L'erreur n°1 que je vois chez les entreprises du BTP :\n\nacheter un logiciel avant de savoir ce qu'on veut lui faire faire.\n\nÇa se passe toujours pareil :\n→ Une démo impressionnante sur un salon.\n→ Un abonnement signé.\n→ Trois mois plus tard, l'outil est à moitié configuré et les équipes sont revenues à Excel.\n\nLe logiciel n'était pas mauvais.\nIl a juste été posé sur des process que personne n'avait mis à plat.\n\nAvant de choisir un outil, prenez une demi-journée pour dessiner le trajet d'une info :\nde la demande du client jusqu'à la facture encaissée.\n\nQui saisit quoi ? À quel moment ? Où ça bloque ?\n\nVous saurez exactement ce qu'il vous faut.\nEt souvent, ce n'est pas ce que le commercial vous a montré."
    },
    {
      "scheduledAt": "2026-11-13T08:30:00+01:00",
      "theme": "Adoption terrain",
      "format": "Texte + image",
      "visualIdea": "Photo d'un compagnon en tenue de chantier, gants, consultant une tablette durcie sur un chantier. Ambiance naturelle, pas posée.",
      "text": "Un outil que les compagnons n'utilisent pas ne sert à rien.\n\nVous pouvez avoir le meilleur logiciel du marché.\nSi l'appli demande 6 clics avec des gants, elle ne sera pas utilisée.\nSi elle ne marche pas sans réseau au sous-sol, elle ne sera pas utilisée.\nSi personne n'a expliqué à quoi elle sert, elle ne sera pas utilisée.\n\nC'est pour ça que, chez nous, on ne choisit jamais un outil depuis un bureau.\n\nOn va sur le chantier.\nOn regarde comment les équipes travaillent vraiment.\nOn fait tester par ceux qui vont s'en servir.\n\nUn projet digital dans le BTP se joue sur le terrain.\nPas dans la salle de réunion."
    },
    {
      "scheduledAt": "2026-11-16T08:30:00+01:00",
      "theme": "Avenants & marge",
      "format": "Texte",
      "visualIdea": "",
      "text": "Les travaux supplémentaires non facturés.\n\nC'est probablement la fuite de marge la plus sous-estimée du BTP.\n\nLe scénario classique :\n→ Le client demande une modif sur place.\n→ Le chef de chantier dit oui, pour ne pas bloquer.\n→ Personne ne l'écrit nulle part.\n→ Deux mois plus tard, au moment de facturer, plus personne ne s'en souvient.\n\nCe n'est la faute de personne.\nC'est qu'il n'existe aucun chemin simple entre « le client a demandé » et « c'est sur la facture ».\n\nLa solution tient souvent en une chose :\nque le chef de chantier puisse noter la demande en 30 secondes sur son téléphone, et qu'elle arrive automatiquement chez la personne qui fait les devis.\n\nPas besoin d'une usine à gaz.\nJuste d'un bon tuyau entre le terrain et le bureau.\n\nEt chez vous, comment remontent les travaux supplémentaires ?"
    },
    {
      "scheduledAt": "2026-11-17T08:30:00+01:00",
      "theme": "Méthode",
      "format": "Carrousel",
      "visualIdea": "Carrousel 6 slides : couverture « Intégrer ses outils en 4 étapes », puis une slide par étape avec une icône simple, dernière slide « Et vous, vous en êtes où ? ».",
      "text": "Comment on intègre les outils d'une entreprise du BTP, en 4 étapes :\n\n1️⃣ Cartographier\nOn suit le trajet d'un chantier, du devis à l'encaissement. On repère chaque double saisie, chaque fichier Excel « maison », chaque blocage.\n\n2️⃣ Prioriser\nOn ne change pas tout d'un coup. On attaque le point qui fait perdre le plus de temps ou d'argent.\n\n3️⃣ Connecter\nOn garde ce qui marche, on remplace ce qui bloque, et on fait communiquer les outils entre eux.\n\n4️⃣ Accompagner\nFormation sur le terrain, référent dans chaque équipe, suivi les premières semaines.\n\nL'étape la plus souvent oubliée ? La 4.\nC'est pourtant elle qui fait qu'un projet réussit."
    },
    {
      "scheduledAt": "2026-11-18T08:30:00+01:00",
      "theme": "Engagement",
      "format": "Question",
      "visualIdea": "",
      "text": "Question aux dirigeants du BTP :\n\nCombien d'outils différents vos équipes utilisent-elles chaque semaine ?\n\nJe compte tout :\n→ le logiciel de devis\n→ la compta\n→ la paie\n→ le planning\n→ les fichiers Excel\n→ les groupes WhatsApp de chantier\n→ le carnet du chef d'équipe\n\nChez la plupart des entreprises que je rencontre, on dépasse facilement les 8.\n\nRépondez en commentaire avec votre chiffre.\nJe partagerai les résultats dans un prochain post."
    },
    {
      "scheduledAt": "2026-11-19T08:30:00+01:00",
      "theme": "Cas client",
      "format": "Storytelling",
      "visualIdea": "Avant/après : à gauche une capture floutée d'un tableur Excel chargé, à droite un tableau de bord simple et clair.",
      "text": "[À COMPLÉTER : type d'entreprise du client, ex. « une entreprise de maçonnerie de 40 salariés »] m'a appelé avec une phrase que je n'oublierai pas :\n\n« On travaille beaucoup, on a du chiffre… mais on ne sait pas si on gagne de l'argent. »\n\nQuand on a ouvert le capot :\n→ [À COMPLÉTER : nombre] fichiers Excel pour suivre les chantiers\n→ des heures pointées sur papier, saisies une fois par mois\n→ une marge calculée uniquement à la fin de l'année\n\nOn n'a pas tout changé.\nOn a connecté le pointage au logiciel de gestion, et on a créé un tableau de bord par chantier.\n\nRésultat : [À COMPLÉTER : résultat réel, ex. « la marge de chaque chantier visible chaque semaine »].\n\nLe dirigeant m'a dit : « Pour la première fois, je pilote au lieu de constater. »\n\nC'est exactement pour ça que je fais ce métier."
    },
    {
      "scheduledAt": "2026-11-20T08:30:00+01:00",
      "theme": "Idée reçue",
      "format": "Texte",
      "visualIdea": "",
      "text": "Un ERP ne réglera pas vos problèmes d'organisation.\n\nJe sais, ce n'est pas ce qu'on vous a vendu.\n\nMais un ERP, c'est un outil qui applique vos règles.\nSi vos règles ne sont pas claires, il appliquera… le flou. En plus cher.\n\nAvant un gros projet logiciel, posez-vous 3 questions :\n\n→ Qui valide un devis, et à partir de quel montant ?\n→ Qui est responsable de la mise à jour d'un chantier : le conducteur de travaux ou l'assistante ?\n→ À quel moment un chantier est-il considéré comme « terminé » dans vos chiffres ?\n\nSi chacun dans l'équipe donne une réponse différente, commencez par là.\n\nL'outil viendra après.\nEt il marchera beaucoup mieux."
    },
    {
      "scheduledAt": "2026-11-23T08:30:00+01:00",
      "theme": "Choisir un logiciel",
      "format": "Liste",
      "visualIdea": "Visuel « checklist » : 6 cases à cocher, titre « Avant de signer avec un éditeur ».",
      "text": "6 questions à poser à un éditeur de logiciel BTP avant de signer :\n\n1. Est-ce que l'appli fonctionne sans réseau ?\n(Les sous-sols et les zones blanches existent.)\n\n2. Comment vos données sortent-elles si on part ?\n(Format, délai, coût.)\n\n3. Avec quels logiciels êtes-vous déjà connecté ?\n(Compta, paie, banque.)\n\n4. Qui nous forme, et sur le terrain ou en visio ?\n\n5. Combien de temps faut-il pour qu'un chef d'équipe sache s'en servir ?\n\n6. Pouvez-vous me mettre en contact avec un client de ma taille et de mon métier ?\n\nSi l'éditeur hésite sur la question 6, posez-vous des questions.\n\nVous en ajouteriez une ?"
    },
    {
      "scheduledAt": "2026-11-24T08:30:00+01:00",
      "theme": "Coulisses",
      "format": "Texte + image",
      "visualIdea": "Photo du fondateur sur un chantier, casque et gilet, en discussion avec un chef de chantier devant un mur en construction.",
      "text": "On me demande souvent pourquoi je passe autant de temps sur les chantiers.\n\nAprès tout, je fais de l'intégration de logiciels. Je pourrais rester derrière un écran.\n\nSauf que tout ce que j'ai appris d'utile, je l'ai appris là-bas :\n\n→ Que le chef d'équipe remplit ses bons le soir, dans sa camionnette, sur ses genoux.\n→ Que le réseau ne passe pas au deuxième sous-sol.\n→ Que « l'outil de la direction » n'a aucune chance s'il fait perdre 10 minutes par jour à ceux qui bossent.\n\nUn bon projet digital dans le BTP commence avec des chaussures de sécurité.\nPas avec un PowerPoint."
    },
    {
      "scheduledAt": "2026-11-25T08:30:00+01:00",
      "theme": "Facture électronique",
      "format": "Texte",
      "visualIdea": "Visuel frise chronologique : 1er septembre 2026 (réception obligatoire pour toutes les entreprises) → 1er septembre 2027 (émission obligatoire pour les PME et TPE).",
      "text": "Facture électronique : où en est votre entreprise ?\n\nPetit rappel du calendrier :\n\n📅 Depuis le 1er septembre 2026, toutes les entreprises doivent pouvoir recevoir des factures électroniques.\n\n📅 Au 1er septembre 2027, les PME et TPE devront aussi les émettre.\n\nDans le BTP, c'est un sujet plus sensible qu'ailleurs :\n→ situations de travaux,\n→ retenues de garantie,\n→ sous-traitance et autoliquidation de la TVA,\n→ factures de clôture…\n\nSi votre logiciel de facturation n'est pas relié à une plateforme agréée, ou si vos factures sortent encore de Word, c'est le moment de s'y mettre.\n\nPas dans 10 mois. Maintenant.\n\nVous avez commencé à vous y préparer ?"
    },
    {
      "scheduledAt": "2026-11-26T08:30:00+01:00",
      "theme": "Pilotage",
      "format": "Texte",
      "visualIdea": "",
      "text": "Connaître sa marge à la fin du chantier, c'est faire une autopsie.\n\nOn comprend ce qui s'est passé.\nMais on ne peut plus rien y faire.\n\nCe que je veux pour mes clients, c'est l'inverse :\nsavoir chaque semaine si un chantier dérape, pendant qu'il est encore temps d'agir.\n\nPour ça, pas besoin d'un tableau de bord avec 40 indicateurs. Il en faut 3 :\n\n→ Heures consommées vs heures prévues\n→ Achats engagés vs budget\n→ Avancement facturé vs avancement réel\n\nTrois chiffres, mis à jour automatiquement, sans que personne ait à les ressaisir.\n\nQuand ces trois chiffres sont au vert, vous dormez mieux.\nQuand l'un passe à l'orange, vous le savez tout de suite."
    },
    {
      "scheduledAt": "2026-11-27T08:30:00+01:00",
      "theme": "Conduite du changement",
      "format": "Texte",
      "visualIdea": "",
      "text": "« Les anciens ne voudront jamais. »\n\nC'est la phrase que j'entends au début de presque chaque projet.\n\nEt presque à chaque fois, c'est faux.\n\nLes compagnons expérimentés ne sont pas contre le changement.\nIls sont contre les outils qui leur font perdre du temps.\nEt ils ont raison.\n\nQuand un chef d'équipe avec 30 ans de métier voit qu'il n'a plus à rappeler le bureau pour connaître sa commande de matériaux, il ne résiste pas.\nIl devient le premier à expliquer l'outil aux jeunes.\n\nLa résistance au changement, c'est souvent un signal :\nl'outil n'a pas été pensé pour ceux qui l'utilisent.\n\nÉcoutez-la. Elle vous dit quoi corriger."
    },
    {
      "scheduledAt": "2026-11-30T08:30:00+01:00",
      "theme": "Automatisation",
      "format": "Liste",
      "visualIdea": "Visuel avec 3 blocs et une icône chacun : relance, compte-rendu, pointage. Titre : « 3 automatisations à mettre en place cette semaine ».",
      "text": "3 automatisations simples qu'une entreprise du BTP peut mettre en place en quelques jours :\n\n1. La relance des devis non signés\nUn rappel automatique au client à J+7 et J+15. Plus de devis oubliés au fond d'une boîte mail.\n\n2. Le compte-rendu de chantier\nLe chef de chantier dicte ou coche sur son téléphone. Le compte-rendu part au client et au bureau, mis en page, avec photos.\n\n3. Les heures du pointage vers la paie\nLes heures saisies sur le terrain arrivent directement dans le logiciel de paie. Zéro ressaisie en fin de mois.\n\nRien de révolutionnaire.\nMais cumulées, ces trois-là libèrent des heures chaque semaine.\n\nLaquelle vous ferait gagner le plus de temps ?"
    },
    {
      "scheduledAt": "2026-12-01T08:30:00+01:00",
      "theme": "Résultats sondage",
      "format": "Texte",
      "visualIdea": "",
      "text": "Il y a deux semaines, je vous demandais combien d'outils vos équipes utilisent chaque semaine.\n\n[À COMPLÉTER : résumé des réponses reçues en commentaires, ex. « Vous avez été nombreux à répondre, la majorité entre 6 et 10 outils »].\n\nCe qui m'a le plus marqué dans vos réponses :\nle groupe WhatsApp revient presque à chaque fois.\n\nEt ce n'est pas un problème en soi. C'est simple, tout le monde l'a, ça marche.\n\nLe problème, c'est que les infos importantes y meurent :\n→ une photo de réserve perdue entre deux messages,\n→ une demande du client noyée dans le fil,\n→ un accord verbal impossible à retrouver.\n\nL'objectif n'est pas d'interdire WhatsApp.\nC'est de faire en sorte que ce qui compte en sorte, et atterrisse au bon endroit.\n\nMerci à tous ceux qui ont joué le jeu 🙏"
    },
    {
      "scheduledAt": "2026-12-02T08:30:00+01:00",
      "theme": "Données",
      "format": "Texte",
      "visualIdea": "",
      "text": "Vos données de chantier valent de l'or.\nEt la plupart des entreprises les jettent.\n\nChaque chantier terminé, c'est :\n→ des heures réelles par type de tâche,\n→ des écarts entre devis et réalité,\n→ des fournisseurs fiables… ou pas.\n\nSi ces infos dorment dans des classeurs ou dans la tête du conducteur de travaux, vous chiffrez le prochain chantier à l'instinct.\n\nSi elles sont centralisées, vous chiffrez avec vos propres chiffres.\nVos devis deviennent plus justes.\nVous savez sur quels types de chantiers vous gagnez vraiment de l'argent.\n\nLe meilleur outil de chiffrage, c'est votre historique.\nEncore faut-il le garder."
    },
    {
      "scheduledAt": "2026-12-03T08:30:00+01:00",
      "theme": "Histoire du fondateur",
      "format": "Storytelling",
      "visualIdea": "Photo personnelle du fondateur, idéalement ancienne (début de carrière, sur un chantier).",
      "text": "Pourquoi j'ai créé [À COMPLÉTER : nom de l'entreprise] ?\n\n[À COMPLÉTER : le déclic personnel du client, en 2-3 phrases. Ex. son parcours avant, le moment où il a vu le problème de près.]\n\nCe que j'ai compris à ce moment-là :\nle BTP ne manque pas de logiciels.\nIl manque de gens qui comprennent à la fois le chantier et les outils, et qui font le lien entre les deux.\n\nLes éditeurs vendent leur produit.\nLes entreprises n'ont pas le temps de tout connecter elles-mêmes.\nEt entre les deux, il y a un trou.\n\nC'est dans ce trou que je travaille.\n\nMon objectif est simple : que vos équipes passent leur temps sur les chantiers, pas sur la paperasse."
    },
    {
      "scheduledAt": "2026-12-04T08:30:00+01:00",
      "theme": "Appel à échanger",
      "format": "Texte",
      "visualIdea": "",
      "text": "Ce mois-ci, j'ai parlé de :\n\n→ la double saisie qui épuise vos équipes,\n→ les travaux supplémentaires jamais facturés,\n→ les logiciels achetés trop vite,\n→ la marge qu'on découvre trop tard,\n→ la facture électronique qui arrive.\n\nSi vous dirigez une entreprise du BTP et qu'au moins un de ces sujets vous parle, j'ai une proposition simple :\n\n30 minutes d'échange, sans engagement.\nVous me racontez comment circule l'info chez vous, du devis à la facture.\nJe vous dis où, selon moi, vous perdez le plus de temps.\n\nÉcrivez-moi en message privé, ou commentez « INFO » et je reviens vers vous."
    }
  ]
}
;
