/* CRFB Construction — scripts du site. Aucun framework. */
(() => {
  "use strict";
  document.documentElement.classList.add("js");
  const nettoyeurs = [];
  const reduit = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* Année du pied de page */
  document.querySelectorAll("[data-annee]").forEach((el) => { el.textContent = String(new Date().getFullYear()); });

  /* Menu mobile */
  const menuBtn = document.querySelector(".menu-btn");
  const nav = document.getElementById("nav-principale");
  if (menuBtn && nav) {
    const fermer = () => { nav.classList.remove("ouvert"); menuBtn.setAttribute("aria-expanded", "false"); menuBtn.querySelector("span").textContent = "Menu"; };
    const basculer = () => {
      const ouvert = nav.classList.toggle("ouvert");
      menuBtn.setAttribute("aria-expanded", String(ouvert));
      menuBtn.querySelector("span").textContent = ouvert ? "Fermer" : "Menu";
      if (ouvert) nav.querySelector("a")?.focus();
    };
    const surTouche = (e) => { if (e.key === "Escape" && nav.classList.contains("ouvert")) { fermer(); menuBtn.focus(); } };
    menuBtn.addEventListener("click", basculer);
    document.addEventListener("keydown", surTouche);
    nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", fermer));
    nettoyeurs.push(() => { menuBtn.removeEventListener("click", basculer); document.removeEventListener("keydown", surTouche); });
  }

  /* Scène signature : la coupe du mur. Chaque couche de texte qui passe au centre de l'écran ajoute sa couche au dessin. */
  const figure = document.querySelector(".coupe-figure");
  const couches = [...document.querySelectorAll(".couche")];
  if (figure && couches.length) {
    const compteur = figure.querySelector("[data-etape-texte]");
    const appliquer = (n) => {
      figure.dataset.etape = String(n);
      couches.forEach((c, i) => { c.classList.toggle("active", i === n - 1); c.classList.toggle("faite", i < n - 1); });
      if (compteur) compteur.textContent = `${n} / ${couches.length}`;
    };
    if (reduit.matches || !("IntersectionObserver" in window)) {
      delete figure.dataset.etape;
      if (compteur) compteur.textContent = `${couches.length} / ${couches.length}`;
    } else {
      appliquer(1);
      const obs = new IntersectionObserver((entrees) => {
        entrees.forEach((e) => { if (e.isIntersecting) appliquer(couches.indexOf(e.target) + 1); });
      }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });
      couches.forEach((c) => obs.observe(c));
      nettoyeurs.push(() => obs.disconnect());
    }
  }

  /* Galerie : filtres + visionneuse */
  const galerie = document.querySelector(".galerie");
  if (galerie) {
    const items = [...galerie.querySelectorAll("li")];
    const boutons = [...document.querySelectorAll(".filtres button")];
    const compte = document.querySelector("[data-compte]");
    const filtrer = (cat) => {
      let n = 0;
      items.forEach((li) => { const ok = cat === "tout" || li.dataset.cat === cat; li.hidden = !ok; if (ok) n++; });
      boutons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filtre === cat)));
      if (compte) compte.textContent = `${n} photo${n > 1 ? "s" : ""}`;
    };
    boutons.forEach((b) => b.addEventListener("click", () => filtrer(b.dataset.filtre)));
    const depart = location.hash.replace("#", "");
    filtrer(boutons.some((b) => b.dataset.filtre === depart) ? depart : "tout");

    const dlg = document.querySelector("dialog.visionneuse");
    if (dlg && typeof dlg.showModal === "function") {
      const img = dlg.querySelector("img");
      const cap = dlg.querySelector("figcaption");
      let courant = 0;
      const visibles = () => items.filter((li) => !li.hidden);
      const montrer = (li) => {
        const src = li.querySelector("img");
        img.src = src.currentSrc || src.src; img.alt = src.alt;
        cap.textContent = li.querySelector(".legende").textContent;
        courant = visibles().indexOf(li);
      };
      galerie.addEventListener("click", (e) => {
        const btn = e.target.closest("button"); if (!btn) return;
        montrer(btn.closest("li")); dlg.showModal();
      });
      dlg.querySelector("[data-prec]").addEventListener("click", () => { const v = visibles(); montrer(v[(courant - 1 + v.length) % v.length]); });
      dlg.querySelector("[data-suiv]").addEventListener("click", () => { const v = visibles(); montrer(v[(courant + 1) % v.length]); });
      dlg.querySelector("[data-fermer]").addEventListener("click", () => dlg.close());
      dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
      dlg.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") dlg.querySelector("[data-suiv]").click();
        if (e.key === "ArrowLeft") dlg.querySelector("[data-prec]").click();
      });
    }
  }

  /* Formulaire de soumission */
  const form = document.getElementById("form-soumission");
  if (form) {
    const etat = document.getElementById("etat-form");
    const envoyer = form.querySelector("button[type=submit]");
    const requis = [...form.querySelectorAll("[required]")];
    const msgErreur = (champ) => {
      if (champ.validity.valueMissing) return champ.dataset.manque || "Ce champ est requis.";
      if (champ.validity.typeMismatch) return "Le format n'est pas valide.";
      if (champ.dataset.chiffres && champ.value.replace(/\D/g, "").length < Number(champ.dataset.chiffres)) return champ.dataset.format || "Le format n'est pas valide.";
      return "";
    };
    const verifier = (champ) => {
      const m = msgErreur(champ);
      const zone = document.getElementById(`${champ.id}-err`);
      champ.setAttribute("aria-invalid", m ? "true" : "false");
      if (zone) { zone.textContent = m; zone.hidden = !m; }
      return !m;
    };
    /* Les erreurs s'effacent pendant la saisie, jamais au moment du clic : pas de bouton qui se déplace sous le curseur. */
    const revalider = (c) => { if (c.getAttribute("aria-invalid") === "true") verifier(c); };
    requis.forEach((c) => { c.addEventListener("input", () => revalider(c)); c.addEventListener("change", () => revalider(c)); });
    const travauxCoches = () => [...form.querySelectorAll("input[name=travaux]:checked")].map((i) => i.value);
    const montrerEtat = (type, titre, texte, recap, focus = true) => {
      etat.className = `etat etat--${type}`;
      etat.innerHTML = "";
      const h = document.createElement("strong"); h.textContent = titre; etat.append(h);
      const p = document.createElement("p"); p.textContent = texte; etat.append(p);
      if (recap) {
        const pre = document.createElement("pre"); pre.id = "recap-demande"; pre.textContent = recap; etat.append(pre);
        const copier = document.createElement("button"); copier.type = "button"; copier.className = "bouton bouton--ligne"; copier.textContent = "Copier la demande";
        copier.addEventListener("click", async () => {
          try { await navigator.clipboard.writeText(recap); copier.textContent = "Demande copiée"; }
          catch { const r = document.createRange(); r.selectNodeContents(pre); const s = getSelection(); s.removeAllRanges(); s.addRange(r); copier.textContent = "Texte sélectionné : faites Copier"; }
        });
        etat.append(copier);
      }
      etat.hidden = false; if (focus) etat.focus();
    };
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const ok = requis.map(verifier).every(Boolean);
      if (!ok) { montrerEtat("erreur", "Il manque des informations.", "Corrigez les champs en rouge, puis envoyez de nouveau.", null, false); form.querySelector("[aria-invalid=true]")?.focus(); return; }
      const d = new FormData(form);
      const recap = [
        `Nom : ${d.get("nom")}`, `Téléphone : ${d.get("telephone")}`, `Courriel : ${d.get("courriel") || "—"}`,
        `Ville : ${d.get("ville")}`, `Travaux : ${travauxCoches().join(", ") || "—"}`, `Échéance : ${d.get("echeance")}`,
        `Description :`, `${d.get("description")}`
      ].join("\n");
      envoyer.setAttribute("aria-busy", "true"); envoyer.disabled = true; envoyer.textContent = "Envoi en cours…";
      const fin = () => { envoyer.removeAttribute("aria-busy"); envoyer.disabled = false; envoyer.textContent = "Envoyer la demande"; };
      const point = form.dataset.endpoint;
      if (!point) {
        /* Maquette : aucun service d'envoi n'est encore branché. On le dit clairement. */
        await new Promise((r) => setTimeout(r, 500));
        fin();
        montrerEtat("succes", "Demande prête — envoi pas encore activé.", "Cette version est une maquette : le formulaire n'est pas encore relié à la boîte de CRFB. Appelez au (514) 867-3247 avec ce résumé.", recap);
        return;
      }
      try {
        const rep = await fetch(point, { method: "POST", body: d, headers: { Accept: "application/json" } });
        if (!rep.ok) throw new Error(String(rep.status));
        fin(); form.reset();
        montrerEtat("succes", "Demande envoyée.", "CRFB Construction vous rappelle pour en discuter. Pour une urgence, appelez au (514) 867-3247.");
      } catch {
        fin();
        montrerEtat("erreur", "L'envoi n'a pas fonctionné.", "Vérifiez votre connexion et réessayez, ou appelez au (514) 867-3247 avec ce résumé.", recap);
      }
    });
  }

  addEventListener("pagehide", () => nettoyeurs.forEach((f) => f()), { once: true });
})();
