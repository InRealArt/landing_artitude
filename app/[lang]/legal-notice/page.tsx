import { redirect } from 'next/navigation'
import { getDictionary, hasLocale, type Locale } from '@/lib/dictionaries'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import LegalArticle from '@/components/ui/LegalArticle'

export default async function LegalNoticePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params

  if (!hasLocale(lang)) redirect('/fr')

  const dict = await getDictionary(lang as Locale)

  return (
    <>
      <Header dict={dict} lang={lang} />
      <main className="bg-canvas text-inkBlack">
        <div className="max-w-4xl mx-auto px-6 py-20 lg:py-28">
          <div className="mb-16 text-center">
            <span className="text-[10px] uppercase tracking-[0.3em] text-grayText font-semibold font-sans block mb-4">
              Artitude by InRealArt
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light leading-tight">
              Mentions Légales & Conditions
            </h1>
            <div className="w-12 h-[1px] bg-current mx-auto my-6 opacity-60" />
          </div>

          <nav className="mb-16 flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center text-[11px] uppercase tracking-widest font-sans">
            <a href="#cga" className="text-grayText hover:text-gold transition-colors">Conditions Générales d&apos;Adhésion</a>
            <a href="#mentions-legales" className="text-grayText hover:text-gold transition-colors">Mentions Légales</a>
            <a href="#confidentialite" className="text-grayText hover:text-gold transition-colors">Confidentialité</a>
          </nav>

          <section id="cga" className="scroll-mt-24">
            <h2 className="font-serif text-2xl sm:text-3xl font-light mb-2">Partie I — Conditions Générales d&apos;Adhésion au programme Artitude (CGA)</h2>
            <p className="font-sans text-[11px] text-grayText uppercase tracking-widest mb-8">EN VIGUEUR AU 3 juillet 2026</p>

            <LegalArticle title="Article 1 — Objet et définitions">
              <p>1.1. Les présentes Conditions Générales d&apos;Adhésion (les « CGA ») régissent l&apos;inscription et la participation des artistes au programme « Artitude » (le « Programme »), édité par le projet Artitude porté par Timothée Roy, agissant au nom et pour le compte de la société InRealArt en cours de constitution, dont les actes ont vocation à être repris après immatriculation (« InRealArt » ou l&apos;« Éditeur »).</p>
              <p>1.2. Le Programme est un service gratuit consistant à créer, optimiser et maintenir une fiche de référencement de l&apos;atelier de l&apos;artiste (la « Fiche ») sur les moteurs et cartographies (Google Search, Google Maps) et à l&apos;intégrer à l&apos;Index des Ateliers publié sur le site InRealArt (l&apos;« Index »).</p>
              <p>1.3. Définitions :</p>
              <p>« Artiste » ou « Adhérent » : toute personne physique ou morale acceptant les présentes CGA et référencée au Programme.</p>
              <p>« Contenus » : photographies, visuels, textes, coordonnées et informations transmis par l&apos;Artiste.</p>
              <p>« Œuvres » : les créations de l&apos;Artiste représentées dans les Contenus.</p>
              <p>« Obligations mensuelles » : les obligations définies à l&apos;Article 5.</p>
            </LegalArticle>

            <LegalArticle title="Article 2 — Gratuité">
              <p>2.1. L&apos;adhésion et l&apos;optimisation de la Fiche par InRealArt sont fournies sans contrepartie financière. Le Programme est gratuit pour l&apos;Artiste : aucune somme n&apos;est due à InRealArt, et les Obligations mensuelles (Article 5) n&apos;entraînent par elles-mêmes aucun frais pour l&apos;Artiste.</p>
              <p>2.2. L&apos;adhésion n&apos;emporte aucun abonnement ni engagement financier. L&apos;« engagement » de l&apos;Artiste est exclusivement opérationnel, au sens de l&apos;Article 5.</p>
            </LegalArticle>

            <LegalArticle title="Article 3 — Conditions d'adhésion">
              <p>3.1. L&apos;adhésion s&apos;effectue via le formulaire en ligne. L&apos;Artiste garantit l&apos;exactitude des informations communiquées.</p>
              <p>3.2. L&apos;adhésion suppose l&apos;acceptation pleine et entière des présentes CGA, matérialisée par la validation du formulaire.</p>
              <p>3.3. InRealArt se réserve le droit de refuser ou de suspendre toute adhésion, sans avoir à en justifier, notamment en cas d&apos;informations inexactes, de Contenus illicites ou de saturation du réseau.</p>
            </LegalArticle>

            <LegalArticle title="Article 4 — Durée">
              <p>4.1. L&apos;adhésion est conclue pour une durée initiale de douze (12) mois à compter de l&apos;activation de la Fiche (durée correspondant à la durée moyenne de vie d&apos;une Fiche).</p>
              <p>4.2. À l&apos;échéance, l&apos;adhésion se renouvelle par tacite reconduction par périodes successives de douze (12) mois, sauf dénonciation par l&apos;une des parties dans les conditions des Articles 7, 8 et 9.</p>
              <p>4.3. Le maintien de la Fiche pendant toute la durée est conditionné au respect des Obligations mensuelles (Article 5).</p>
            </LegalArticle>

            <LegalArticle title="Article 5 — Obligations mensuelles de l'Artiste">
              <p>Pendant toute la durée de l&apos;adhésion, l&apos;Artiste s&apos;engage à réaliser, chaque mois calendaire, les deux obligations suivantes :</p>
              <p>5.1. Transmission de photographies. L&apos;Artiste transmet à InRealArt, au plus tard le dernier jour de chaque mois, un minimum de vingt (20) photographies de ses Œuvres, en respectant la nomenclature de fichiers suivante : Nomartiste_nomoeuvre. InRealArt appose ensuite son préfixe pour aboutir à la dénomination : InRealArt_Nomartiste_nomoeuvre. Les photographies doivent être de qualité suffisante pour une exploitation en ligne et libres de tout droit de tiers (cf. Article 6).</p>
              <p>5.2. Sollicitation d&apos;avis. L&apos;Artiste s&apos;engage, chaque mois calendaire, à solliciter des avis auprès de son entourage (proches, connaissances, visiteurs de l&apos;atelier) afin d&apos;alimenter et d&apos;animer sa fiche d&apos;atelier. Cette obligation est une obligation de moyens (démarche de sollicitation) et n&apos;impose ni note minimale ni nombre d&apos;avis obtenus. L&apos;Artiste veille à ce que les avis sollicités soient sincères et reflètent une opinion réelle. Sont strictement prohibés les avis fictifs, achetés, ou faussement présentés comme émanant de clients, conformément aux articles L.111-7-2 et L.121-4 du Code de la consommation et aux règles des plateformes d&apos;avis. Cette sollicitation n&apos;entraîne aucun coût pour l&apos;Artiste.</p>
              <p>5.3. Les Obligations mensuelles constituent des obligations essentielles et déterminantes du maintien de la Fiche. Leur inexécution déclenche la procédure de l&apos;Article 7.</p>
            </LegalArticle>

            <LegalArticle title="Article 6 — Propriété intellectuelle et licence">
              <p>6.1. Titularité. L&apos;Artiste demeure seul titulaire des droits de propriété intellectuelle sur ses Œuvres et sur les photographies transmises. Les présentes CGA n&apos;emportent aucune cession de propriété.</p>
              <p>6.2. Licence. L&apos;Artiste concède à InRealArt, pour les seuls besoins du Programme, une licence non exclusive, gratuite, mondiale, pour la durée de l&apos;adhésion, l&apos;autorisant à reproduire, représenter, adapter techniquement (recadrage, redimensionnement, renommage selon la nomenclature de l&apos;Article 5.1) et diffuser les Contenus sur la Fiche, l&apos;Index, Google et les partenaires techniques du Programme, avec faculté de sous-licence au profit de ces plateformes.</p>
              <p>6.3. Droit moral. Le droit moral de l&apos;Artiste est respecté ; en particulier, son nom reste associé à chaque Œuvre (la nomenclature préservant l&apos;attribution). Aucune modification portant atteinte à l&apos;intégrité de l&apos;Œuvre ne sera opérée.</p>
              <p>6.4. Garantie. L&apos;Artiste garantit qu&apos;il détient l&apos;ensemble des droits sur les Contenus, que les photographies ne portent atteinte à aucun droit de tiers (photographe, personnes représentées, marques) et il garantit InRealArt contre tout recours à ce titre.</p>
              <p>6.5. Cessation. À la fin de l&apos;adhésion, la licence prend fin et InRealArt cesse toute nouvelle exploitation des Contenus dans un délai raisonnable, sous réserve des copies de cache des moteurs tiers échappant à son contrôle.</p>
            </LegalArticle>

            <LegalArticle title="Article 7 — Procédure de rappel et de retrait pour manquement">
              <p>7.1. En cas d&apos;inexécution de l&apos;une des Obligations mensuelles (Article 5), InRealArt adresse à l&apos;Artiste un premier rappel par email, l&apos;invitant à régulariser sous huit (8) jours.</p>
              <p>7.2. À défaut de régularisation, InRealArt adresse un second (et dernier) rappel, ouvrant un ultime délai de huit (8) jours.</p>
              <p>7.3. À défaut de régularisation à l&apos;issue du second rappel, l&apos;adhésion est résiliée de plein droit et la Fiche est retirée du Programme et de l&apos;Index, sans indemnité et sans autre formalité, l&apos;Artiste en étant informé par email.</p>
              <p>7.4. Cette procédure ne fait pas obstacle à la faculté de retrait discrétionnaire prévue à l&apos;Article 8.</p>
            </LegalArticle>

            <LegalArticle title="Article 8 — Faculté de retrait à l'initiative d'InRealArt">
              <p>8.1. Le Programme étant un service gratuit d&apos;intérêt éditorial, InRealArt peut retirer une Fiche et mettre fin à une adhésion à tout moment, y compris en dehors de tout manquement, moyennant un préavis de [30] jours notifié par email.</p>
              <p>8.2. Ce délai de préavis n&apos;est pas requis en cas de manquement grave (Contenus illicites, atteinte à l&apos;image du réseau, fausses informations, atteinte aux droits de tiers), le retrait étant alors immédiat.</p>
              <p>8.3. Le retrait à l&apos;initiative d&apos;InRealArt n&apos;ouvre droit à aucune indemnité au profit de l&apos;Artiste.</p>
            </LegalArticle>

            <LegalArticle title="Article 9 — Résiliation à l'initiative de l'Artiste">
              <p>L&apos;Artiste peut résilier son adhésion à tout moment et sans motif, par simple demande écrite (email) ou via son espace, avec prise d&apos;effet sous [15] jours. Aucun frais n&apos;est dû.</p>
            </LegalArticle>

            <LegalArticle title="Article 9 bis — Droit de rétractation (artistes non professionnels)">
              <p>9bis.1. L&apos;Artiste agissant en qualité de consommateur (non professionnel) dispose d&apos;un droit de rétractation de quatorze (14) jours à compter de la conclusion de l&apos;adhésion, sans avoir à motiver sa décision (art. L.221-18 du Code de la consommation).</p>
              <p>9bis.2. Pour l&apos;exercer, l&apos;Artiste notifie sa décision par une déclaration dénuée d&apos;ambiguïté (email à contact@inrealart.com ou formulaire type annexé). Le service étant gratuit, l&apos;exercice de la rétractation n&apos;entraîne aucun frais ni remboursement.</p>
              <p>9bis.3. L&apos;activation de la Fiche pouvant intervenir sous 48 heures, soit avant l&apos;expiration du délai, l&apos;Artiste consommateur qui souhaite une activation immédiate en fait la demande expresse. La gratuité du Programme fait qu&apos;aucune somme ne sera due même si la Fiche a déjà été activée avant la fin du délai de rétractation.</p>
              <p>9bis.4. Le présent article ne s&apos;applique pas aux artistes agissant à titre professionnel.</p>
            </LegalArticle>

            <LegalArticle title="Article 10 — Responsabilité">
              <p>10.1. InRealArt est tenu d&apos;une obligation de moyens quant à l&apos;optimisation et la visibilité de la Fiche. Elle ne garantit aucun résultat en termes de positionnement, de trafic ou de fréquentation, ces éléments dépendant de tiers (notamment Google) et de facteurs extérieurs.</p>
              <p>10.2. InRealArt ne saurait être tenue responsable des conséquences d&apos;informations erronées fournies par l&apos;Artiste, ni des avis sollicités par ce dernier auprès de son entourage (Article 5.2).</p>
              <p>10.3. La responsabilité d&apos;InRealArt, si elle était engagée, serait en tout état de cause limitée aux dommages directs et prévisibles.</p>
            </LegalArticle>

            <LegalArticle title="Article 11 — Données personnelles">
              <p>Le traitement des données personnelles est décrit dans la Politique de confidentialité (Partie III), qui fait partie intégrante des présentes CGA.</p>
            </LegalArticle>

            <LegalArticle title="Article 12 — Modification des CGA">
              <p>InRealArt peut modifier les présentes CGA. Les modifications sont notifiées par email et/ou publiées ; elles s&apos;appliquent aux adhésions en cours à l&apos;issue d&apos;un délai de [30] jours, l&apos;Artiste pouvant résilier s&apos;il les refuse.</p>
            </LegalArticle>

            <LegalArticle title="Article 13 — Droit applicable et litiges">
              <p>13.1. Les présentes CGA sont soumises au droit français.</p>
              <p>13.2. En cas de litige, les parties rechercheront une solution amiable.</p>
              <p>13.3. Artistes professionnels : à défaut d&apos;accord amiable, compétence du Tribunal de commerce de Paris.</p>
              <p>13.4. Artistes non professionnels (consommateurs) : conformément aux articles L.612-1 et s. du Code de la consommation, l&apos;Artiste peut recourir gratuitement au médiateur de la consommation CM2C, 01 89 47 00 14, 49 Rue de Ponthieu, 75008 Paris et, à défaut de résolution, saisir les juridictions de droit commun compétentes. La plateforme européenne de règlement en ligne des litiges reste par ailleurs accessible.</p>
            </LegalArticle>
          </section>

          <section id="mentions-legales" className="scroll-mt-24 mt-20">
            <h2 className="font-serif text-2xl sm:text-3xl font-light mb-2">Partie II — Mentions légales</h2>

            <LegalArticle title="Éditeur / Responsable">
              <p>Projet « Artitude » porté par Timothée Roy, agissant au nom et pour le compte de la société InRealArt en cours de constitution.</p>
              <p>Adresse email : contact@inrealart.com</p>
              <p>Mention : société en cours de constitution — immatriculation en cours au RCS de Paris.</p>
              <p>Directeur de la publication : Timothée Roy.</p>
            </LegalArticle>

            <LegalArticle title="Hébergeur">
              <p>Dénomination : OVH</p>
              <p>Adresse : 2 RUE KELLERMANN 59100 ROUBAIX</p>
              <p>Téléphone : 1007</p>
            </LegalArticle>

            <LegalArticle title="Propriété intellectuelle">
              <p>L&apos;ensemble des éléments du site (marques, logos, textes, éléments graphiques) est protégé. Toute reproduction non autorisée est interdite. Les Œuvres et visuels des artistes référencés restent la propriété de leurs auteurs respectifs.</p>
            </LegalArticle>

            <LegalArticle title="Médiation de la consommation">
              <p>Conformément aux articles L.612-1 et s. du Code de la consommation, le consommateur peut recourir gratuitement au médiateur : CM2C, 01 89 47 00 14, 49 Rue de Ponthieu, 75008 Paris.</p>
            </LegalArticle>
          </section>

          <section id="confidentialite" className="scroll-mt-24 mt-20">
            <h2 className="font-serif text-2xl sm:text-3xl font-light mb-2">Partie III — Politique de confidentialité (RGPD)</h2>
            <p className="font-sans text-[11px] text-grayText uppercase tracking-widest mb-8">Conforme au Règlement (UE) 2016/679 (RGPD) et à la loi Informatique et Libertés modifiée.</p>

            <LegalArticle title="1. Responsable de traitement">
              <p>Le responsable de traitement est Timothée Roy, agissant pour le compte de la société InRealArt en cours de constitution.</p>
              <p>Contact : contact@inrealart.com.</p>
            </LegalArticle>

            <LegalArticle title="2. Données collectées">
              <p>Via le formulaire d&apos;inscription et l&apos;usage du Programme :</p>
              <p>Identité et contact : nom et prénom, adresse email, téléphone.</p>
              <p>Activité : nom de l&apos;atelier / activité, médium artistique principal, site web.</p>
              <p>Localisation : adresse de l&apos;atelier, horaires.</p>
              <p>Contenus : photographies des œuvres.</p>
              <p>Données de navigation : le cas échéant, cookies et traceurs (voir section 9).</p>
            </LegalArticle>

            <LegalArticle title="3. Finalités et bases légales">
              <p>Création, optimisation et maintien de la Fiche — Exécution du contrat (art. 6.1.b RGPD).</p>
              <p>Gestion de la relation avec l&apos;artiste (rappels, suivi) — Exécution du contrat (art. 6.1.b RGPD).</p>
              <p>Envoi d&apos;actualités / newsletter InRealArt — Consentement (art. 6.1.a RGPD).</p>
              <p>Amélioration du service, statistiques — Intérêt légitime (art. 6.1.f RGPD).</p>
              <p>Respect des obligations légales — Obligation légale (art. 6.1.c RGPD).</p>
              <p>L&apos;envoi de la newsletter et des sollicitations d&apos;accompagnement suppose le consentement recueilli via la case à cocher dédiée du formulaire ; ce consentement est révocable à tout moment.</p>
            </LegalArticle>

            <LegalArticle title="4. Destinataires">
              <p>Les données sont destinées aux services habilités d&apos;InRealArt et, pour les besoins du Programme, à ses sous-traitants et partenaires techniques (notamment hébergeur, plateformes de référencement telles que Google, outil d&apos;emailing). Les données de la Fiche destinées à être publiques (nom de l&apos;atelier, adresse, horaires, visuels) sont, par nature, diffusées en ligne. Les données ne sont jamais revendues.</p>
            </LegalArticle>

            <LegalArticle title="5. Transferts hors UE">
              <p>Certains partenaires (ex. Google) peuvent impliquer des transferts hors UE, encadrés par des garanties appropriées (clauses contractuelles types de la Commission européenne, décision d&apos;adéquation le cas échéant).</p>
            </LegalArticle>

            <LegalArticle title="6. Durées de conservation">
              <p>Artistes actifs : pendant toute la durée de l&apos;adhésion.</p>
              <p>Après la fin de l&apos;adhésion : archivage intermédiaire à des fins de preuve pendant la durée de prescription applicable, puis suppression.</p>
              <p>Prospects / non-adhérents : 3 ans à compter du dernier contact (recommandation CNIL).</p>
              <p>Consentement newsletter : jusqu&apos;au retrait du consentement (désinscription).</p>
              <p>Cookies : durée maximale de 13 mois (ou selon la réglementation en vigueur).</p>
            </LegalArticle>

            <LegalArticle title="7. Sécurité">
              <p>InRealArt met en œuvre des mesures techniques et organisationnelles appropriées pour protéger les données contre tout accès, altération ou divulgation non autorisés.</p>
            </LegalArticle>

            <LegalArticle title="8. Droits des personnes">
              <p>Conformément au RGPD, toute personne dispose des droits d&apos;accès, de rectification, d&apos;effacement, de limitation, d&apos;opposition, de portabilité, ainsi que du droit de retirer son consentement et de définir des directives post-mortem. Ces droits s&apos;exercent auprès de : contact@inrealart.com. En cas de difficulté, la personne peut saisir la CNIL (www.cnil.fr).</p>
            </LegalArticle>

            <LegalArticle title="9. Cookies et traceurs">
              <p>Le site peut utiliser des cookies. Les cookies non essentiels ne sont déposés qu&apos;après consentement via le bandeau dédié.</p>
            </LegalArticle>

            <LegalArticle title="10. Avis sollicités">
              <p>Les avis que l&apos;Artiste sollicite auprès de son entourage (Article 5.2 des CGA) doivent refléter une opinion sincère. Le traitement des données des personnes laissant un avis (identité, contenu de l&apos;avis) relève, selon le canal utilisé, de la plateforme d&apos;avis concernée et/ou de l&apos;Artiste. La collecte et la publication d&apos;avis sont soumises aux obligations de loyauté et de transparence (art. L.111-7-2 du Code de la consommation), notamment l&apos;absence d&apos;avis fictifs ou faussement présentés comme émanant de clients.</p>
            </LegalArticle>

            <LegalArticle title="11. Contact">
              <p>Pour toute question relative à la présente politique : contact@inrealart.com.</p>
            </LegalArticle>
          </section>
        </div>
      </main>
      <Footer dict={dict} lang={lang} />
    </>
  )
}
