/**
 * ============================================================
 * Marriage Biodata Generator (বিয়ের বায়োডাটা)
 * Modular vanilla JS — render, storage, theme, download
 * ============================================================
 */

(function () {
  "use strict";

  /* ------------------------------------------------------------------
   * 1. CONSTANTS & STATE
   * ------------------------------------------------------------------ */
  const STORAGE_KEY = "biodata_generator_v1";
  const BD_MOBILE_RE = /^01[3-9]\d{8}$/;

  /** Exact A4 pixel box @ 96dpi — preview + PDF share this layout */
  const A4_PX_W = 794;
  const A4_PX_H = 1123;
  const A4_MM_W = 210;
  const A4_MM_H = 297;
  /** Usable content height inside .a4-page-inner (padding + border accounted) */
  const A4_CONTENT_MAX_H = 980;

  const state = {
    lang: "bn", // 'bn' | 'en'
    theme: "emerald",
    fontSize: "medium",
    showBismillah: true,
    showPhoto: true,
    photoBase64: "",
    siblings: [],
  };

  /** @type {HTMLElement} */
  const previewEl = document.getElementById("preview-container");

  /* ------------------------------------------------------------------
   * 2. i18n LABELS
   * ------------------------------------------------------------------ */
  const I18N = {
    bn: {
      appTitle: "বিয়ের বায়োডাটা জেনারেটর",
      toggleBismillah: "বিসমিল্লাহ",
      togglePhoto: "ছবি দেখান",
      loadSample: "নমুনা ডেটা",
      resetAll: "রিসেট",
      downloadPng: "PNG ডাউনলোড",
      downloadPdf: "PDF ডাউনলোড",
      print: "প্রিন্ট",
      privacyTip: "গোপনীয়তা টিপ: NID নম্বর বা exact bank details বায়োডাটা-তে দিবেন না।",
      tabForm: "ফর্ম",
      tabPreview: "প্রিভিউ",
      secPersonal: "১. ব্যক্তিগত তথ্য",
      secEducation: "২. শিক্ষাগত যোগ্যতা",
      secProfession: "৩. পেশা ও আয়",
      secAddress: "৪. ঠিকানা",
      secFamily: "৫. পারিবারিক তথ্য",
      secLifestyle: "৬. ধর্ম ও জীবনযাপন",
      secExpectations: "৭. প্রত্যাশা",
      secContact: "৮. যোগাযোগ",
      secPhoto: "৯. ছবি",
      name: "নাম",
      nickname: "ডাকনাম",
      dob: "জন্ম তারিখ",
      age: "বয়স",
      birthplace: "জন্মস্থান",
      height: "উচ্চতা",
      weight: "ওজন",
      complexion: "গায়ের রং",
      bloodGroup: "রক্তের গ্রুপ",
      religion: "ধর্ম / মাজহাব",
      maritalStatus: "বৈবাহিক অবস্থা",
      unmarried: "অবিবাহিত",
      divorced: "তালাকপ্রাপ্ত",
      widowed: "বিধবা/বিপত্নীক",
      eduTitle: "যোগ্যতার নাম",
      eduTitleHint: "যোগ্যতার নাম নিজে লিখুন (যেমন: এসএসসি, দাখিল, অনার্স)। খালি সারি প্রিভিউতে দেখাবে না।",
      institution: "প্রতিষ্ঠান",
      subject: "বিষয় / গ্রুপ",
      year: "সাল",
      result: "ফলাফল",
      profession: "বর্তমান পেশা",
      designation: "প্রতিষ্ঠান ও পদবী",
      workplace: "কর্মস্থল",
      income: "মাসিক আয়",
      futurePlan: "ভবিষ্যৎ পরিকল্পনা",
      presentAddress: "বর্তমান ঠিকানা",
      permanentAddress: "স্থায়ী ঠিকানা",
      houseType: "বাড়ির ধরন",
      ownHouse: "নিজস্ব বাড়ি",
      rented: "ভাড়া বাড়ি",
      flat: "ফ্ল্যাট",
      fatherName: "পিতার নাম",
      fatherProfession: "পিতার পেশা",
      motherName: "মাতার নাম",
      motherProfession: "মাতার পেশা",
      aliveDeceased: "জীবিত / মৃত",
      alive: "জীবিত",
      deceased: "মৃত",
      siblings: "ভাই-বোন",
      addRow: "+ সারি যোগ",
      removeRow: "− সারি মুছুন",
      sibName: "নাম",
      sibRelation: "সম্পর্ক",
      sibAge: "বয়স",
      sibEducation: "শিক্ষা",
      sibProfession: "পেশা",
      sibMarital: "বৈবাহিক",
      unclesAunts: "চাচা/মামা/ফুফু/খালা (ঐচ্ছিক)",
      familyStatus: "পারিবারিক অবস্থা",
      middle: "মধ্যবিত্ত",
      upperMiddle: "উচ্চ মধ্যবিত্ত",
      upper: "উচ্চবিত্ত",
      lowerMiddle: "নিম্ন মধ্যবিত্ত",
      propertyInfo: "সম্পত্তির তথ্য (ঐচ্ছিক)",
      religiousPractice: "ধর্মীয় চর্চা",
      habits: "ধূমপান / অন্যান্য অভ্যাস",
      hobbies: "শখ",
      expAge: "বয়সসীমা",
      expHeight: "উচ্চতা",
      expEducation: "শিক্ষা",
      expOther: "অন্যান্য শর্ত",
      guardianName: "অভিভাবকের নাম",
      mobile: "মোবাইল / হোয়াটসঅ্যাপ",
      email: "ইমেইল (ঐচ্ছিক)",
      mobileError: "সঠিক বাংলাদেশি মোবাইল নম্বর দিন (01XXXXXXXXX)",
      noPhoto: "ছবি নেই",
      uploadPhoto: "ছবি আপলোড",
      clearPhoto: "ছবি মুছুন",
      photoHint: "ছবি শুধু মেমোরিতে রাখা হয়; সার্ভারে আপলোড হয় না।",
      photoReady: "প্রস্তুত",
      exporting: "প্রস্তুত করা হচ্ছে…",
      bioTitle: "বিয়ের বায়োডাটা",
      docTitle: "বায়োডাটার শিরোনাম",
      docTitlePh: "বিয়ের বায়োডাটা",
      years: "বছর",
      page: "পৃষ্ঠা",
      emptyPreview: "বাম পাশের ফর্ম পূরণ করুন — প্রিভিউ এখানে দেখা যাবে।",
      previewPersonal: "ব্যক্তিগত তথ্য",
      previewEducation: "শিক্ষাগত যোগ্যতা",
      previewProfession: "পেশা ও আয়",
      previewAddress: "ঠিকানা",
      previewFamily: "পারিবারিক তথ্য",
      previewLifestyle: "ধর্ম ও জীবনযাপন",
      previewExpectations: "প্রত্যাশা",
      previewContact: "যোগাযোগ",
      father: "পিতা",
      mother: "মাতা",
      status: "অবস্থা",
      resetConfirm: "সব তথ্য মুছে ফেলতে চান? এটি পূর্বাবস্থায় ফেরানো যাবে না।",
      sampleLoaded: "নমুনা ডেটা লোড হয়েছে",
      resetDone: "সব তথ্য মুছে ফেলা হয়েছে",
      pngReady: "PNG ডাউনলোড হয়েছে",
      pdfReady: "PDF ডাউনলোড হয়েছে",
      invalidMobile: "মোবাইল নম্বর সঠিক নয়",
      photoCropped: "ছবি যোগ করা হয়েছে",
    },
    en: {
      appTitle: "Marriage Biodata Generator",
      toggleBismillah: "Bismillah",
      togglePhoto: "Show photo",
      loadSample: "Sample data",
      resetAll: "Reset",
      downloadPng: "Download PNG",
      downloadPdf: "Download PDF",
      print: "Print",
      privacyTip: "Privacy tip: Do not put NID number or exact bank details in the biodata.",
      tabForm: "Form",
      tabPreview: "Preview",
      secPersonal: "1. Personal Details",
      secEducation: "2. Education",
      secProfession: "3. Profession & Income",
      secAddress: "4. Address",
      secFamily: "5. Family Details",
      secLifestyle: "6. Religion & Lifestyle",
      secExpectations: "7. Expectations",
      secContact: "8. Contact",
      secPhoto: "9. Photo",
      name: "Name",
      nickname: "Nickname",
      dob: "Date of birth",
      age: "Age",
      birthplace: "Birthplace",
      height: "Height",
      weight: "Weight",
      complexion: "Skin complexion",
      bloodGroup: "Blood group",
      religion: "Religion / Sect",
      maritalStatus: "Marital status",
      unmarried: "Unmarried",
      divorced: "Divorced",
      widowed: "Widowed",
      eduTitle: "Qualification title",
      eduTitleHint: "Type your own qualification title (e.g. SSC, Dakhil, Honours). Empty rows stay hidden in preview.",
      institution: "Institution",
      subject: "Subject / Group",
      year: "Year",
      result: "Result",
      profession: "Current profession",
      designation: "Organization & designation",
      workplace: "Workplace",
      income: "Monthly income",
      futurePlan: "Future plan",
      presentAddress: "Present address",
      permanentAddress: "Permanent address",
      houseType: "House type",
      ownHouse: "Own house",
      rented: "Rented",
      flat: "Flat",
      fatherName: "Father's name",
      fatherProfession: "Father's profession",
      motherName: "Mother's name",
      motherProfession: "Mother's profession",
      aliveDeceased: "Alive / Deceased",
      alive: "Alive",
      deceased: "Deceased",
      siblings: "Siblings",
      addRow: "+ Add row",
      removeRow: "− Remove row",
      sibName: "Name",
      sibRelation: "Relation",
      sibAge: "Age",
      sibEducation: "Education",
      sibProfession: "Profession",
      sibMarital: "Marital",
      unclesAunts: "Uncles / Aunts (optional)",
      familyStatus: "Family status",
      middle: "Middle class",
      upperMiddle: "Upper-middle class",
      upper: "Upper class",
      lowerMiddle: "Lower-middle class",
      propertyInfo: "Property info (optional)",
      religiousPractice: "Religious practice",
      habits: "Smoking / other habits",
      hobbies: "Hobbies",
      expAge: "Age range",
      expHeight: "Height",
      expEducation: "Education",
      expOther: "Other requirements",
      guardianName: "Guardian name",
      mobile: "Mobile / WhatsApp",
      email: "Email (optional)",
      mobileError: "Enter a valid BD mobile (01XXXXXXXXX)",
      noPhoto: "No photo",
      uploadPhoto: "Upload photo",
      clearPhoto: "Clear photo",
      photoHint: "Photo stays in memory only; never uploaded to a server.",
      photoReady: "Ready",
      exporting: "Preparing…",
      bioTitle: "Marriage Biodata",
      docTitle: "Biodata title",
      docTitlePh: "Marriage Biodata",
      years: "years",
      page: "Page",
      emptyPreview: "Fill the form on the left — preview appears here.",
      previewPersonal: "Personal Details",
      previewEducation: "Education",
      previewProfession: "Profession & Income",
      previewAddress: "Address",
      previewFamily: "Family Details",
      previewLifestyle: "Religion & Lifestyle",
      previewExpectations: "Expectations",
      previewContact: "Contact",
      father: "Father",
      mother: "Mother",
      status: "Status",
      resetConfirm: "Clear all data? This cannot be undone.",
      sampleLoaded: "Sample data loaded",
      resetDone: "All data cleared",
      pngReady: "PNG downloaded",
      pdfReady: "PDF downloaded",
      invalidMobile: "Mobile number is invalid",
      photoCropped: "Photo added",
    },
  };

  function t(key) {
    return (I18N[state.lang] && I18N[state.lang][key]) || I18N.bn[key] || key;
  }

  function applyI18n() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (I18N[state.lang][key] != null) el.textContent = I18N[state.lang][key];
    });
    document.querySelectorAll("[data-i18n-option]").forEach((el) => {
      const key = el.getAttribute("data-i18n-option");
      if (I18N[state.lang][key] != null) el.textContent = I18N[state.lang][key];
    });
    document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
      const key = el.getAttribute("data-i18n-ph");
      if (I18N[state.lang][key] != null) el.placeholder = I18N[state.lang][key];
    });
    const langBtn = document.getElementById("btn-lang");
    if (langBtn) langBtn.innerHTML = state.lang === "bn" ? '<span class="en">EN</span>' : '<span class="bn">বাং</span>';
    document.documentElement.lang = state.lang === "bn" ? "bn" : "en";
  }

  /* ------------------------------------------------------------------
   * 3. THEME & FONT SIZE
   * ------------------------------------------------------------------ */
  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    document.querySelectorAll(".theme-swatch").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-theme") === theme);
    });
    saveToStorage();
    renderPreview();
  }

  function applyFontSize(size) {
    state.fontSize = size;
    document.documentElement.setAttribute("data-fontsize", size);
    document.querySelectorAll(".fontsize-btn").forEach((btn) => {
      const active = btn.getAttribute("data-fontsize") === size;
      btn.classList.toggle("bg-slate-100", active);
      btn.classList.toggle("font-semibold", active);
    });
    saveToStorage();
    renderPreview();
  }

  /* ------------------------------------------------------------------
   * 4. STORAGE
   * ------------------------------------------------------------------ */
  function collectFormData() {
    const data = {
      lang: state.lang,
      theme: state.theme,
      fontSize: state.fontSize,
      showBismillah: state.showBismillah,
      showPhoto: state.showPhoto,
      photoBase64: state.photoBase64,
      siblings: state.siblings,
      fields: {},
      education: { edu1: {}, edu2: {}, edu3: {}, edu4: {} },
    };

    const ids = [
      "docTitle",
      "name", "nickname", "dob", "age", "birthplace", "height", "weight",
      "complexion", "bloodGroup", "religion", "maritalStatus",
      "profession", "designation", "workplace", "income", "futurePlan",
      "presentAddress", "permanentAddress", "houseType",
      "fatherName", "fatherProfession", "fatherStatus",
      "motherName", "motherProfession", "motherStatus",
      "unclesAunts", "familyStatus", "propertyInfo",
      "religiousPractice", "habits", "hobbies",
      "expAge", "expHeight", "expEducation", "expOther",
      "guardianName", "mobile", "email",
    ];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) data.fields[id] = el.value;
    });

    document.querySelectorAll("[data-edu]").forEach((el) => {
      const level = el.getAttribute("data-edu");
      const field = el.getAttribute("data-field");
      if (!data.education[level]) data.education[level] = {};
      data.education[level][field] = el.value;
    });

    return data;
  }

  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(collectFormData()));
    } catch (e) {
      console.warn("localStorage save failed", e);
    }
  }

  function restoreFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      applySavedData(data);
      return true;
    } catch (e) {
      console.warn("localStorage restore failed", e);
      return false;
    }
  }

  function applySavedData(data) {
    if (!data) return;
    state.lang = data.lang || "bn";
    state.theme = data.theme || "emerald";
    state.fontSize = data.fontSize || "medium";
    state.showBismillah = data.showBismillah !== false;
    state.showPhoto = data.showPhoto !== false;
    state.photoBase64 = data.photoBase64 || "";
    state.siblings = Array.isArray(data.siblings) ? data.siblings : [];

    document.documentElement.setAttribute("data-theme", state.theme);
    document.documentElement.setAttribute("data-fontsize", state.fontSize);
    document.getElementById("toggle-bismillah").checked = state.showBismillah;
    document.getElementById("toggle-photo").checked = state.showPhoto;

    if (data.fields) {
      Object.keys(data.fields).forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.value = data.fields[id] || "";
      });
    }

    if (data.education) {
      // Migrate old fixed keys (ssc/hsc/grad/post) → edu1–edu4
      const legacyMap = { ssc: "edu1", hsc: "edu2", grad: "edu3", post: "edu4" };
      const legacyTitles = { ssc: "এসএসসি / দাখিল", hsc: "এইচএসসি / আলিম", grad: "স্নাতক", post: "স্নাতকোত্তর / অন্যান্য" };
      Object.keys(data.education).forEach((level) => {
        const target = legacyMap[level] || level;
        const row = data.education[level] || {};
        Object.keys(row).forEach((field) => {
          const el = document.querySelector(`[data-edu="${target}"][data-field="${field}"]`);
          if (el) el.value = row[field] || "";
        });
        if (legacyMap[level] && !row.title) {
          const titleEl = document.querySelector(`[data-edu="${target}"][data-field="title"]`);
          const hasAny = Object.values(row).some((v) => String(v || "").trim());
          if (titleEl && hasAny) titleEl.value = legacyTitles[level] || "";
        }
      });
    }

    renderSiblingsTable();
    updatePhotoPreview();
    calcAge();
    applyTheme(state.theme);
    applyFontSize(state.fontSize);
    applyI18n();
  }

  function clearStorageAndForm() {
    localStorage.removeItem(STORAGE_KEY);
    document.querySelectorAll(".form-input, #age").forEach((el) => {
      if (el.tagName === "SELECT") el.selectedIndex = 0;
      else el.value = "";
    });
    const titleEl = document.getElementById("docTitle");
    if (titleEl) titleEl.value = t("bioTitle");
    state.photoBase64 = "";
    state.siblings = [];
    state.showBismillah = true;
    state.showPhoto = true;
    document.getElementById("toggle-bismillah").checked = true;
    document.getElementById("toggle-photo").checked = true;
    document.getElementById("photo-input").value = "";
    clearMobileError();
    renderSiblingsTable();
    updatePhotoPreview();
    renderPreview();
    saveToStorage();
  }

  function getDocTitle() {
    return val("docTitle") || t("bioTitle");
  }

  /* ------------------------------------------------------------------
   * 5. HELPERS
   * ------------------------------------------------------------------ */
  function val(id) {
    const el = document.getElementById(id);
    return el ? String(el.value || "").trim() : "";
  }

  function eduVal(level, field) {
    const el = document.querySelector(`[data-edu="${level}"][data-field="${field}"]`);
    return el ? String(el.value || "").trim() : "";
  }

  function optionLabel(selectId, map) {
    const v = val(selectId);
    if (!v) return "";
    return map[v] || v;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function showToast(msg) {
    const toast = document.getElementById("toast");
    toast.textContent = msg;
    toast.classList.remove("hidden");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.add("hidden"), 2500);
  }

  function setExporting(on) {
    const ov = document.getElementById("export-overlay");
    ov.classList.toggle("hidden", !on);
    ov.classList.toggle("flex", on);
  }

  function calcAge() {
    const dob = val("dob");
    const ageEl = document.getElementById("age");
    if (!dob) {
      ageEl.value = "";
      return;
    }
    const birth = new Date(dob);
    if (Number.isNaN(birth.getTime())) {
      ageEl.value = "";
      return;
    }
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    ageEl.value = age >= 0 ? `${age} ${t("years")}` : "";
  }

  function formatDateBn(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  function filenameBase() {
    const name = (val("name") || "Biodata").replace(/[\\/:*?"<>|]+/g, "").replace(/\s+/g, "_");
    const d = new Date();
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return `Biodata_${name}_${date}`;
  }

  /* ------------------------------------------------------------------
   * 6. VALIDATION
   * ------------------------------------------------------------------ */
  function clearMobileError() {
    const mobile = document.getElementById("mobile");
    const err = document.getElementById("mobile-error");
    mobile.classList.remove("field-error");
    err.classList.add("hidden");
  }

  function validateMobile() {
    const mobile = document.getElementById("mobile");
    const err = document.getElementById("mobile-error");
    const v = mobile.value.trim();
    if (!v) {
      clearMobileError();
      return true;
    }
    const ok = BD_MOBILE_RE.test(v);
    mobile.classList.toggle("field-error", !ok);
    err.classList.toggle("hidden", ok);
    return ok;
  }

  /* ------------------------------------------------------------------
   * 7. SIBLINGS TABLE
   * ------------------------------------------------------------------ */
  function emptySibling() {
    return { name: "", relation: "", age: "", education: "", profession: "", marital: "" };
  }

  function renderSiblingsTable() {
    const tbody = document.getElementById("siblings-tbody");
    tbody.innerHTML = "";
    state.siblings.forEach((sib, idx) => {
      const tr = document.createElement("tr");
      tr.className = "border-t border-slate-100";
      tr.innerHTML = `
        <td class="p-1"><input data-sib="${idx}" data-sf="name" type="text" value="${escapeHtml(sib.name)}" class="w-full min-w-[70px] rounded border border-slate-200 px-1.5 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-500" /></td>
        <td class="p-1"><input data-sib="${idx}" data-sf="relation" type="text" value="${escapeHtml(sib.relation)}" class="w-full min-w-[60px] rounded border border-slate-200 px-1.5 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-500" /></td>
        <td class="p-1"><input data-sib="${idx}" data-sf="age" type="text" value="${escapeHtml(sib.age)}" class="w-full min-w-[40px] rounded border border-slate-200 px-1.5 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-500" /></td>
        <td class="p-1"><input data-sib="${idx}" data-sf="education" type="text" value="${escapeHtml(sib.education)}" class="w-full min-w-[70px] rounded border border-slate-200 px-1.5 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-500" /></td>
        <td class="p-1"><input data-sib="${idx}" data-sf="profession" type="text" value="${escapeHtml(sib.profession)}" class="w-full min-w-[70px] rounded border border-slate-200 px-1.5 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-500" /></td>
        <td class="p-1"><input data-sib="${idx}" data-sf="marital" type="text" value="${escapeHtml(sib.marital)}" class="w-full min-w-[60px] rounded border border-slate-200 px-1.5 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-500" /></td>
      `;
      tbody.appendChild(tr);
    });
  }

  function syncSiblingsFromInputs() {
    document.querySelectorAll("[data-sib]").forEach((inp) => {
      const idx = Number(inp.getAttribute("data-sib"));
      const field = inp.getAttribute("data-sf");
      if (state.siblings[idx]) state.siblings[idx][field] = inp.value;
    });
  }

  function addSiblingRow() {
    syncSiblingsFromInputs();
    state.siblings.push(emptySibling());
    renderSiblingsTable();
    saveToStorage();
    renderPreview();
  }

  function removeSiblingRow() {
    syncSiblingsFromInputs();
    if (state.siblings.length === 0) return;
    state.siblings.pop();
    renderSiblingsTable();
    saveToStorage();
    renderPreview();
  }

  /* ------------------------------------------------------------------
   * 8. PHOTO (crop to fit frame via canvas → base64)
   * ------------------------------------------------------------------ */
  function updatePhotoPreview() {
    const box = document.getElementById("photo-preview");
    const card = document.getElementById("photo-upload-card");
    const badge = document.getElementById("photo-badge");
    const hasPhoto = Boolean(state.photoBase64);

    if (hasPhoto) {
      box.innerHTML = `<img src="${state.photoBase64}" alt="Photo preview" />`;
    } else {
      box.innerHTML = `
        <div class="photo-empty-state">
          <svg class="photo-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6.75 4.5h10.5A2.25 2.25 0 0119.5 6.75v10.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 17.25V6.75A2.25 2.25 0 016.75 4.5z"/>
            <circle cx="9" cy="9.5" r="1.25" fill="currentColor" stroke="none"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 16.5l4.2-4.2a1.2 1.2 0 011.7 0L15 16.4l1.3-1.3a1.2 1.2 0 011.7 0l1.5 1.5"/>
          </svg>
          <span class="text-[11px] text-slate-400 text-center">${escapeHtml(t("noPhoto"))}</span>
        </div>`;
    }

    if (card) card.classList.toggle("has-photo", hasPhoto);
    if (badge) {
      badge.textContent = t("photoReady");
      badge.classList.toggle("hidden", !hasPhoto);
    }
  }

  /**
   * Center-crop image into portrait frame (ratio ~ 28:34) and return JPEG base64.
   */
  function cropImageToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          const targetW = 420;
          const targetH = 510; // 28:34 ratio
          const canvas = document.createElement("canvas");
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext("2d");

          const srcRatio = img.width / img.height;
          const dstRatio = targetW / targetH;
          let sx, sy, sw, sh;
          if (srcRatio > dstRatio) {
            sh = img.height;
            sw = img.height * dstRatio;
            sx = (img.width - sw) / 2;
            sy = 0;
          } else {
            sw = img.width;
            sh = img.width / dstRatio;
            sx = 0;
            sy = (img.height - sh) / 2;
          }
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, targetW, targetH);
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
          resolve(canvas.toDataURL("image/jpeg", 0.9));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  async function handlePhotoUpload(file) {
    if (!file || !file.type.startsWith("image/")) return;
    try {
      state.photoBase64 = await cropImageToBase64(file);
      updatePhotoPreview();
      // Open photo section so the premium preview is visible
      const section = document.getElementById("photo-section");
      if (section && !section.classList.contains("open")) {
        section.classList.add("open");
        const toggle = section.querySelector(".section-toggle");
        if (toggle) toggle.setAttribute("aria-expanded", "true");
      }
      saveToStorage();
      renderPreview();
      showToast(t("photoCropped"));
    } catch (e) {
      console.error(e);
      showToast("Photo upload failed");
    }
  }

  function clearPhoto() {
    state.photoBase64 = "";
    document.getElementById("photo-input").value = "";
    updatePhotoPreview();
    saveToStorage();
    renderPreview();
  }

  /* ------------------------------------------------------------------
   * 9. PREVIEW RENDER (multi-page A4)
   * ------------------------------------------------------------------ */
  function kv(key, value) {
    if (!value) return "";
    return `<div class="bio-kv"><div class="bio-kv-key">${escapeHtml(key)}</div><div class="bio-kv-val">${escapeHtml(value)}</div></div>`;
  }

  function sectionHtml(title, body) {
    if (!body || !String(body).trim()) return "";
    return `<div class="bio-section"><div class="bio-section-title"><span class="bio-section-title-text">${escapeHtml(title)}</span></div>${body}</div>`;
  }

  function buildEduBlock(level) {
    const title = eduVal(level, "title");
    const institution = eduVal(level, "institution");
    const subject = eduVal(level, "subject");
    const year = eduVal(level, "year");
    const result = eduVal(level, "result");
    if (!title && !institution && !subject && !year && !result) return "";
    const parts = [institution, subject, year, result].filter(Boolean).join(" · ");
    const label = title || parts;
    const detail = title && parts ? parts : title ? "" : parts;
    if (title && detail) {
      return `<div class="bio-edu-block"><span class="bio-edu-label">${escapeHtml(title)}:</span> ${escapeHtml(detail)}</div>`;
    }
    return `<div class="bio-edu-block"><span class="bio-edu-label">${escapeHtml(label)}</span></div>`;
  }

  function maritalMap() {
    return { unmarried: t("unmarried"), divorced: t("divorced"), widowed: t("widowed") };
  }
  function houseMap() {
    return { own: t("ownHouse"), rented: t("rented"), flat: t("flat") };
  }
  function aliveMap() {
    return { alive: t("alive"), deceased: t("deceased") };
  }
  function familyMap() {
    return { middle: t("middle"), upperMiddle: t("upperMiddle"), upper: t("upper"), lowerMiddle: t("lowerMiddle") };
  }

  function buildAllSections() {
    const sections = [];

    // Personal
    let personal = "";
    personal += kv(t("name"), val("name"));
    personal += kv(t("nickname"), val("nickname"));
    personal += kv(t("dob"), formatDateBn(val("dob")));
    personal += kv(t("age"), val("age"));
    personal += kv(t("birthplace"), val("birthplace"));
    personal += kv(t("height"), val("height"));
    personal += kv(t("weight"), val("weight"));
    personal += kv(t("complexion"), val("complexion"));
    personal += kv(t("bloodGroup"), val("bloodGroup"));
    personal += kv(t("religion"), val("religion"));
    personal += kv(t("maritalStatus"), optionLabel("maritalStatus", maritalMap()));
    sections.push(sectionHtml(t("previewPersonal"), personal));

    // Education — custom titles (no fixed SSC/HSC)
    let edu = "";
    ["edu1", "edu2", "edu3", "edu4"].forEach((level) => {
      edu += buildEduBlock(level);
    });
    sections.push(sectionHtml(t("previewEducation"), edu));

    // Profession
    let prof = "";
    prof += kv(t("profession"), val("profession"));
    prof += kv(t("designation"), val("designation"));
    prof += kv(t("workplace"), val("workplace"));
    prof += kv(t("income"), val("income"));
    prof += kv(t("futurePlan"), val("futurePlan"));
    sections.push(sectionHtml(t("previewProfession"), prof));

    // Address
    let addr = "";
    addr += kv(t("presentAddress"), val("presentAddress"));
    addr += kv(t("permanentAddress"), val("permanentAddress"));
    addr += kv(t("houseType"), optionLabel("houseType", houseMap()));
    sections.push(sectionHtml(t("previewAddress"), addr));

    // Family
    let fam = "";
    const fName = val("fatherName");
    const fProf = val("fatherProfession");
    const fStat = optionLabel("fatherStatus", aliveMap());
    if (fName || fProf || fStat) {
      fam += kv(t("father"), [fName, fProf, fStat].filter(Boolean).join(" — "));
    }
    const mName = val("motherName");
    const mProf = val("motherProfession");
    const mStat = optionLabel("motherStatus", aliveMap());
    if (mName || mProf || mStat) {
      fam += kv(t("mother"), [mName, mProf, mStat].filter(Boolean).join(" — "));
    }

    syncSiblingsFromInputs();
    const filledSibs = state.siblings.filter(
      (s) => s.name || s.relation || s.age || s.education || s.profession || s.marital
    );
    if (filledSibs.length) {
      const cell = (txt) => `<span>${escapeHtml(txt)}</span>`;
      let table = `<table class="bio-table"><thead><tr>
        <th>${cell(t("sibName"))}</th>
        <th>${cell(t("sibRelation"))}</th>
        <th>${cell(t("sibAge"))}</th>
        <th>${cell(t("sibEducation"))}</th>
        <th>${cell(t("sibProfession"))}</th>
        <th>${cell(t("sibMarital"))}</th>
      </tr></thead><tbody>`;
      filledSibs.forEach((s) => {
        table += `<tr>
          <td>${cell(s.name)}</td>
          <td>${cell(s.relation)}</td>
          <td>${cell(s.age)}</td>
          <td>${cell(s.education)}</td>
          <td>${cell(s.profession)}</td>
          <td>${cell(s.marital)}</td>
        </tr>`;
      });
      table += "</tbody></table>";
      fam += `<div style="margin-top:6px"><div class="bio-edu-label" style="margin-bottom:2px">${escapeHtml(t("siblings"))}</div>${table}</div>`;
    }

    fam += kv(t("unclesAunts"), val("unclesAunts"));
    fam += kv(t("familyStatus"), optionLabel("familyStatus", familyMap()));
    fam += kv(t("propertyInfo"), val("propertyInfo"));
    sections.push(sectionHtml(t("previewFamily"), fam));

    // Lifestyle
    let life = "";
    life += kv(t("religiousPractice"), val("religiousPractice"));
    life += kv(t("habits"), val("habits"));
    life += kv(t("hobbies"), val("hobbies"));
    sections.push(sectionHtml(t("previewLifestyle"), life));

    // Expectations
    let exp = "";
    exp += kv(t("expAge"), val("expAge"));
    exp += kv(t("expHeight"), val("expHeight"));
    exp += kv(t("expEducation"), val("expEducation"));
    exp += kv(t("expOther"), val("expOther"));
    sections.push(sectionHtml(t("previewExpectations"), exp));

    // Contact
    let contact = "";
    contact += kv(t("guardianName"), val("guardianName"));
    contact += kv(t("mobile"), val("mobile"));
    contact += kv(t("email"), val("email"));
    sections.push(sectionHtml(t("previewContact"), contact));

    return sections.filter(Boolean);
  }

  function buildHeaderHtml(isFirstPage) {
    // Page 2+ : no title, no page number — content only
    if (!isFirstPage) return "";

    const hasPhoto = state.showPhoto && state.photoBase64;
    const photoHtml = hasPhoto
      ? `<div class="bio-photo-frame">
          <span class="bio-photo-corner tl"></span>
          <span class="bio-photo-corner tr"></span>
          <span class="bio-photo-corner bl"></span>
          <span class="bio-photo-corner br"></span>
          <div class="bio-photo-inner"><img src="${state.photoBase64}" alt="" /></div>
        </div>`
      : "";

    const bismillah = state.showBismillah
      ? `<div class="bio-bismillah">بسم الله الرحمن الرحيم</div>`
      : "";

    return `<div class="bio-header${hasPhoto ? " has-photo" : ""}">
      <div class="bio-header-row">
        <div class="bio-header-text">
          ${bismillah}
          <div class="bio-title">${escapeHtml(getDocTitle())}</div>
        </div>
        ${photoHtml}
      </div>
    </div>`;
  }

  function createPageShell(pageIndex, isFirst) {
    const page = document.createElement("div");
    page.className = "a4-page" + (isFirst ? " a4-page-first" : " a4-page-cont");
    page.setAttribute("data-page", String(pageIndex + 1));
    page.innerHTML = `
      <div class="a4-page-inner">
        <div class="a4-content">
          ${buildHeaderHtml(isFirst)}
          <div class="page-sections"></div>
        </div>
      </div>
    `;
    return page;
  }

  /**
   * Scale fixed A4 pages to fit the preview panel without changing layout.
   * Transform only — text wrapping / alignment stay identical to PDF.
   */
  function scalePreviewToFit() {
    const scroll = previewEl.parentElement;
    if (!scroll) return;
    const available = Math.max(280, scroll.clientWidth - 8);
    const scale = Math.min(1, available / A4_PX_W);
    previewEl.style.width = `${A4_PX_W}px`;
    previewEl.style.transform = `scale(${scale})`;
    previewEl.style.transformOrigin = "top center";
    // Compensate layout height so the scroll area isn't huge empty space
    const pages = previewEl.querySelectorAll(".a4-page").length || 1;
    const naturalH = pages * (A4_PX_H + 24) + 8;
    previewEl.style.marginBottom = `${Math.max(0, naturalH * (scale - 1))}px`;
  }

  /**
   * Paginate by appending sections against fixed A4 content height
   * (same value used for preview + export — keeps PDF aligned).
   */
  function renderPreview() {
    const sections = buildAllSections();
    previewEl.innerHTML = "";

    if (sections.length === 0 && !(state.showPhoto && state.photoBase64)) {
      const page = createPageShell(0, true);
      page.querySelector(".page-sections").innerHTML =
        `<div class="bio-empty-hint bn">${escapeHtml(t("emptyPreview"))}</div>`;
      previewEl.appendChild(page);
      updatePageLabels();
      scalePreviewToFit();
      return;
    }

    let pageIndex = 0;
    let page = createPageShell(pageIndex, true);
    previewEl.appendChild(page);
    let sectionsHost = page.querySelector(".page-sections");

    sections.forEach((html) => {
      const wrap = document.createElement("div");
      wrap.innerHTML = html;
      const node = wrap.firstElementChild;
      if (!node) return;

      sectionsHost.appendChild(node);

      const content = page.querySelector(".a4-content");
      if (content.scrollHeight > A4_CONTENT_MAX_H && sectionsHost.children.length > 1) {
        sectionsHost.removeChild(node);
        pageIndex += 1;
        page = createPageShell(pageIndex, false);
        previewEl.appendChild(page);
        sectionsHost = page.querySelector(".page-sections");
        sectionsHost.appendChild(node);
      }
    });

    updatePageLabels();
    scalePreviewToFit();
  }

  function updatePageLabels() {
    // No page titles/numbers on continuation pages (by design)
  }

  /* ------------------------------------------------------------------
   * 10. DOWNLOAD — WYSIWYG capture (same A4 box as preview)
   * ------------------------------------------------------------------ */
  async function waitForFonts() {
    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch (_) { /* ignore */ }
    }
    await new Promise((r) => setTimeout(r, 250));
  }

  function nextFrame() {
    return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  }

  /**
   * Clone each preview page into an off-screen A4 mount and capture.
   * No transform / no reflow — PDF matches preview alignment pixel-for-pixel.
   */
  async function capturePages() {
    await waitForFonts();
    // Ensure latest preview layout (unscaled content tree)
    renderPreview();
    await nextFrame();

    const pages = Array.from(previewEl.querySelectorAll(".a4-page"));
    if (!pages.length) return [];

    let mount = document.getElementById("export-mount");
    if (!mount) {
      mount = document.createElement("div");
      mount.id = "export-mount";
      document.body.appendChild(mount);
    }
    mount.setAttribute("data-theme", document.documentElement.getAttribute("data-theme") || "emerald");
    mount.setAttribute("data-fontsize", document.documentElement.getAttribute("data-fontsize") || "medium");
    mount.classList.add("exporting");

    const canvases = [];

    try {
      for (const page of pages) {
        mount.innerHTML = "";
        const clone = page.cloneNode(true);
        clone.style.cssText = [
          `width:${A4_PX_W}px`,
          `height:${A4_PX_H}px`,
          `min-height:${A4_PX_H}px`,
          "max-width:none",
          "margin:0",
          "box-shadow:none",
          "transform:none",
          "overflow:hidden",
          "background:#ffffff",
        ].join(";");
        mount.appendChild(clone);
        await nextFrame();

        const canvas = await html2canvas(clone, {
          scale: 2,
          width: A4_PX_W,
          height: A4_PX_H,
          windowWidth: A4_PX_W,
          windowHeight: A4_PX_H,
          x: 0,
          y: 0,
          scrollX: 0,
          scrollY: 0,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
          imageTimeout: 0,
          // Helps Bangla glyph metrics settle before paint
          foreignObjectRendering: false,
          onclone: (clonedDoc) => {
            const root = clonedDoc.documentElement;
            root.setAttribute("data-theme", document.documentElement.getAttribute("data-theme") || "emerald");
            root.setAttribute("data-fontsize", document.documentElement.getAttribute("data-fontsize") || "medium");
            root.classList.add("exporting");

            const srcStyle = getComputedStyle(document.documentElement);
            const dst = clonedDoc.getElementById("export-mount") || clonedDoc.body;
            if (dst) dst.classList.add("exporting");
            [
              "--theme-primary",
              "--theme-primary-dark",
              "--theme-accent",
              "--theme-border",
              "--theme-heading",
              "--theme-bar",
              "--font-scale",
            ].forEach((prop) => {
              dst.style.setProperty(prop, srcStyle.getPropertyValue(prop));
              root.style.setProperty(prop, srcStyle.getPropertyValue(prop));
            });

            // Keep section titles identical to preview (optical center via translateY)
            clonedDoc.querySelectorAll(".bio-section-title").forEach((el) => {
              el.style.display = "block";
              el.style.height = "28px";
              el.style.lineHeight = "28px";
              el.style.padding = "0 10px";
              el.style.boxSizing = "border-box";
              el.style.overflow = "hidden";
              el.style.whiteSpace = "nowrap";
            });
            clonedDoc.querySelectorAll(".bio-section-title-text").forEach((el) => {
              el.style.display = "inline-block";
              el.style.lineHeight = "1";
              el.style.verticalAlign = "middle";
              el.style.padding = "0";
              el.style.position = "relative";
              el.style.top = "-5px";
              el.style.transform = "none";
            });
            clonedDoc.querySelectorAll(".bio-table th, .bio-table td").forEach((el) => {
              el.style.padding = "4px 6px 8px";
              el.style.lineHeight = "1.2";
              el.style.verticalAlign = "middle";
              el.style.fontSize = "12px";
            });
            clonedDoc.querySelectorAll(".bio-table th span, .bio-table td span").forEach((el) => {
              el.style.display = "inline-block";
              el.style.position = "relative";
              el.style.top = "-3px";
              el.style.lineHeight = "1.15";
            });
          },
        });

        canvases.push(normalizeA4Canvas(canvas));
      }
    } finally {
      mount.classList.remove("exporting");
      mount.innerHTML = "";
      scalePreviewToFit();
    }

    return canvases;
  }

  /** Ensure canvas is exactly A4 aspect (794:1123) — no stretch in PDF */
  function normalizeA4Canvas(source) {
    const out = document.createElement("canvas");
    out.width = A4_PX_W * 2; // match scale:2
    out.height = A4_PX_H * 2;
    const ctx = out.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, out.width, out.height);

    const srcRatio = source.width / source.height;
    const dstRatio = out.width / out.height;
    let dw = out.width;
    let dh = out.height;
    let dx = 0;
    let dy = 0;
    if (srcRatio > dstRatio) {
      // slightly wider — fit width, letterbox vertically
      dh = out.width / srcRatio;
      dy = (out.height - dh) / 2;
    } else if (srcRatio < dstRatio) {
      dw = out.height * srcRatio;
      dx = (out.width - dw) / 2;
    }
    ctx.drawImage(source, dx, dy, dw, dh);
    return out;
  }

  /**
   * Place canvas onto jsPDF A4 page preserving aspect ratio (no stretch).
   */
  function addCanvasToPdf(pdf, canvas) {
    const imgData = canvas.toDataURL("image/jpeg", 0.98);
    const cRatio = canvas.width / canvas.height;
    const pRatio = A4_MM_W / A4_MM_H;
    let w = A4_MM_W;
    let h = A4_MM_H;
    let x = 0;
    let y = 0;
    if (Math.abs(cRatio - pRatio) < 0.01) {
      // Exact A4 — full bleed
      pdf.addImage(imgData, "JPEG", 0, 0, A4_MM_W, A4_MM_H, undefined, "MEDIUM");
      return;
    }
    if (cRatio > pRatio) {
      w = A4_MM_W;
      h = A4_MM_W / cRatio;
      y = (A4_MM_H - h) / 2;
    } else {
      h = A4_MM_H;
      w = A4_MM_H * cRatio;
      x = (A4_MM_W - w) / 2;
    }
    pdf.addImage(imgData, "JPEG", x, y, w, h, undefined, "MEDIUM");
  }

  async function downloadPng() {
    if (!validateMobile() && val("mobile")) {
      showToast(t("invalidMobile"));
      return;
    }
    setExporting(true);
    try {
      const canvases = await capturePages();
      if (canvases.length === 1) {
        const a = document.createElement("a");
        a.download = `${filenameBase()}.png`;
        a.href = canvases[0].toDataURL("image/png");
        a.click();
      } else {
        for (let i = 0; i < canvases.length; i++) {
          const a = document.createElement("a");
          a.download = `${filenameBase()}_p${i + 1}.png`;
          a.href = canvases[i].toDataURL("image/png");
          a.click();
          await new Promise((r) => setTimeout(r, 300));
        }
      }
      showToast(t("pngReady"));
    } catch (e) {
      console.error(e);
      showToast("PNG export failed");
    } finally {
      setExporting(false);
    }
  }

  async function downloadPdf() {
    if (!validateMobile() && val("mobile")) {
      showToast(t("invalidMobile"));
      return;
    }
    setExporting(true);
    try {
      const canvases = await capturePages();
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
        hotfixes: ["px_scaling"],
      });

      canvases.forEach((canvas, i) => {
        if (i > 0) pdf.addPage("a4", "portrait");
        addCanvasToPdf(pdf, canvas);
      });

      pdf.save(`${filenameBase()}.pdf`);
      showToast(t("pdfReady"));
    } catch (e) {
      console.error(e);
      showToast("PDF export failed");
    } finally {
      setExporting(false);
    }
  }

  function printBiodata() {
    window.print();
  }

  /* ------------------------------------------------------------------
   * 11. SAMPLE DATA
   * ------------------------------------------------------------------ */
  function loadSampleData() {
    const sample = {
      lang: state.lang,
      theme: state.theme,
      fontSize: state.fontSize,
      showBismillah: true,
      showPhoto: true,
      photoBase64: state.photoBase64,
      siblings: [
        { name: "ফাতেমা আক্তার", relation: "বোন", age: "২৪", education: "এমবিবিএস", profession: "ইন্টার্ন ডাক্তার", marital: "অবিবাহিত" },
        { name: "রাফি আহমেদ", relation: "ভাই", age: "১৯", education: "এইচএসসি", profession: "ছাত্র", marital: "অবিবাহিত" },
      ],
      fields: {
        docTitle: "বিয়ের বায়োডাটা",
        name: "মোহাম্মদ আরিফ হোসেন",
        nickname: "আরিফ",
        dob: "1996-05-14",
        age: "",
        birthplace: "কুমিল্লা",
        height: "৫'৮\"",
        weight: "৭২ কেজি",
        complexion: "ফরসা",
        bloodGroup: "B+",
        religion: "ইসলাম (সুন্নি, হানাফি)",
        maritalStatus: "unmarried",
        profession: "সফটওয়্যার ইঞ্জিনিয়ার",
        designation: "সিনিয়র ডেভেলপার, ABC Tech Ltd.",
        workplace: "ঢাকা",
        income: "৮০,০০০ টাকা",
        futurePlan: "ক্যারিয়ার ও পারিবারিক জীবনে স্থিতিশীলতা বজায় রাখা",
        presentAddress: "বাড়ি #১২, রোড #৫, মিরপুর-১০, ঢাকা-১২১৬",
        permanentAddress: "গ্রাম: রামপুর, ডাকঘর: চৌদ্দগ্রাম, উপজেলা: চৌদ্দগ্রাম, জেলা: কুমিল্লা",
        houseType: "own",
        fatherName: "মো. আবদুল করিম",
        fatherProfession: "অবসরপ্রাপ্ত সরকারি কর্মকর্তা",
        fatherStatus: "alive",
        motherName: "রোকেয়া বেগম",
        motherProfession: "গৃহিণী",
        motherStatus: "alive",
        unclesAunts: "চাচা: ব্যবসায়ী (কুমিল্লা); মামা: শিক্ষক (ঢাকা)",
        familyStatus: "upperMiddle",
        propertyInfo: "কুমিল্লায় পৈতৃক বাড়ি ও কিছু কৃষিজমি",
        religiousPractice: "নিয়মিত পাঁচ ওয়াক্ত নামাজ আদায় করি",
        habits: "ধূমপান করি না",
        hobbies: "বই পড়া, ভ্রমণ, ফুটবল",
        expAge: "২২–২৮ বছর",
        expHeight: "৫'২\" বা তার বেশি",
        expEducation: "স্নাতক বা তদূর্ধ্ব",
        expOther: "ধর্মপরায়ণা, ভালো চরিত্র ও পারিবারিক মূল্যবোধসম্পন্ন",
        guardianName: "মো. আবদুল করিম (পিতা)",
        mobile: "01712345678",
        email: "arif.example@email.com",
      },
      education: {
        edu1: { title: "এসএসসি", institution: "কুমিল্লা জিলা স্কুল", subject: "বিজ্ঞান", year: "২০১২", result: "GPA ৫.০০" },
        edu2: { title: "এইচএসসি", institution: "নটর ডেম কলেজ, ঢাকা", subject: "বিজ্ঞান", year: "২০১৪", result: "GPA ৫.০০" },
        edu3: { title: "বিএসসি ইঞ্জিনিয়ারিং", institution: "বাংলাদেশ প্রকৌশল বিশ্ববিদ্যালয় (বুয়েট)", subject: "সিএসই", year: "২০১৯", result: "CGPA ৩.৬৫" },
        edu4: { title: "", institution: "", subject: "", year: "", result: "" },
      },
    };
    applySavedData(sample);
    calcAge();
    saveToStorage();
    renderPreview();
    showToast(t("sampleLoaded"));
  }

  /* ------------------------------------------------------------------
   * 12. UI EVENTS
   * ------------------------------------------------------------------ */
  function setupCollapsibles() {
    document.querySelectorAll(".section-toggle").forEach((btn) => {
      btn.addEventListener("click", () => {
        const section = btn.closest(".form-section");
        const open = section.classList.toggle("open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });
  }

  function setupMobileTabs() {
    document.querySelectorAll(".mobile-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        const target = tab.getAttribute("data-tab");
        document.querySelectorAll(".mobile-tab").forEach((tbtn) => {
          const active = tbtn.getAttribute("data-tab") === target;
          tbtn.classList.toggle("bg-emerald-600", active);
          tbtn.classList.toggle("text-white", active);
          tbtn.classList.toggle("text-slate-600", !active);
        });
        document.getElementById("panel-form").classList.toggle("active", target === "form");
        document.getElementById("panel-preview").classList.toggle("active", target === "preview");
      });
    });
  }

  function onFormChange() {
    calcAge();
    validateMobile();
    syncSiblingsFromInputs();
    saveToStorage();
    renderPreview();
  }

  function bindEvents() {
    // Live form updates
    document.getElementById("panel-form").addEventListener("input", onFormChange);
    document.getElementById("panel-form").addEventListener("change", onFormChange);

    document.getElementById("dob").addEventListener("change", () => {
      calcAge();
      onFormChange();
    });

    document.getElementById("btn-lang").addEventListener("click", () => {
      state.lang = state.lang === "bn" ? "en" : "bn";
      applyI18n();
      calcAge();
      saveToStorage();
      renderPreview();
    });

    document.querySelectorAll(".theme-swatch").forEach((btn) => {
      btn.addEventListener("click", () => applyTheme(btn.getAttribute("data-theme")));
    });

    document.querySelectorAll(".fontsize-btn").forEach((btn) => {
      btn.addEventListener("click", () => applyFontSize(btn.getAttribute("data-fontsize")));
    });

    document.getElementById("toggle-bismillah").addEventListener("change", (e) => {
      state.showBismillah = e.target.checked;
      saveToStorage();
      renderPreview();
    });

    document.getElementById("toggle-photo").addEventListener("change", (e) => {
      state.showPhoto = e.target.checked;
      saveToStorage();
      renderPreview();
    });

    document.getElementById("btn-add-sibling").addEventListener("click", addSiblingRow);
    document.getElementById("btn-remove-sibling").addEventListener("click", removeSiblingRow);

    document.getElementById("photo-input").addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) handlePhotoUpload(file);
    });
    document.getElementById("btn-clear-photo").addEventListener("click", clearPhoto);

    document.getElementById("btn-sample").addEventListener("click", loadSampleData);
    document.getElementById("btn-reset").addEventListener("click", () => {
      if (confirm(t("resetConfirm"))) {
        clearStorageAndForm();
        showToast(t("resetDone"));
      }
    });
    document.getElementById("btn-png").addEventListener("click", downloadPng);
    document.getElementById("btn-pdf").addEventListener("click", downloadPdf);
    document.getElementById("btn-print").addEventListener("click", printBiodata);

    let resizeTimer = null;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(scalePreviewToFit, 100);
    });
  }

  /* ------------------------------------------------------------------
   * 13. INIT
   * ------------------------------------------------------------------ */
  function init() {
    setupCollapsibles();
    setupMobileTabs();
    bindEvents();

    const restored = restoreFromStorage();
    if (!restored) {
      applyI18n();
      applyTheme("emerald");
      applyFontSize("medium");
      renderSiblingsTable();
      updatePhotoPreview();
      renderPreview();
    } else {
      renderPreview();
    }

    // Re-scale after fonts/layout settle
    waitForFonts().then(scalePreviewToFit);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
