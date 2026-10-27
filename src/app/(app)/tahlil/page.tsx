import { BookOpenText, HeartHandshake } from "lucide-react";
import { TahlilReader } from "@/components/tahlil-reader";
import type { TahlilReading } from "@/components/tahlil-reader";

const readings: TahlilReading[] = [
  {
    title: "Pengantar Al-Fatihah",
    note: "Pembuka",
    repetition: "1×",
    arabic:
      "إِلَى حَضْرَةِ النَّبِيِّ الْمُصْطَفَى سَيِّدِنَا مُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ وَآلِهِ وَأَزْوَاجِهِ وَأَوْلَادِهِ وَذُرِّيَّاتِهِ الْفَاتِحَةُ",
    latin:
      "Ilā ḥaḍratin-nabiyyil-muṣṭafā sayyidinā Muḥammadin ṣallallāhu ‘alaihi wa sallama wa ālihi wa azwājihi wa aulādihi wa dzurriyyātihil-Fātiḥah.",
    meaning:
      "Kepada yang terhormat Nabi Muhammad ﷺ, keluarga, istri, anak, dan keturunannya. Al-Fatihah.",
  },
  {
    title: "Surat Al-Fatihah",
    note: "QS 1:1–7",
    repetition: "1×",
    arabic:
      "بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ ۞ اَلْحَمْدُ لِلّٰهِ رَبِّ الْعٰلَمِيْنَ ۞ الرَّحْمٰنِ الرَّحِيْمِ ۞ مٰلِكِ يَوْمِ الدِّيْنِ ۞ اِيَّاكَ نَعْبُدُ وَاِيَّاكَ نَسْتَعِيْنُ ۞ اِهْدِنَا الصِّرَاطَ الْمُسْتَقِيْمَ ۞ صِرَاطَ الَّذِيْنَ اَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوْبِ عَلَيْهِمْ وَلَا الضَّآلِّيْنَ ۞ آمِيْنَ",
    latin:
      "Bismillāhir-raḥmānir-raḥīm. Al-ḥamdu lillāhi rabbil-‘ālamīn. Ar-raḥmānir-raḥīm. Māliki yaumid-dīn. Iyyāka na‘budu wa iyyāka nasta‘īn. Ihdinaṣ-ṣirāṭal-mustaqīm. Ṣirāṭallażīna an‘amta ‘alaihim, gairil-magḍūbi ‘alaihim wa laḍ-ḍāllīn. Āmīn.",
    meaning:
      "Dengan nama Allah Yang Maha Pengasih, Maha Penyayang. Segala puji bagi Allah, Tuhan seluruh alam, Yang Maha Pengasih, Maha Penyayang, Pemilik hari pembalasan. Hanya kepada-Mu kami menyembah dan hanya kepada-Mu kami memohon pertolongan. Tunjukilah kami jalan yang lurus, yaitu jalan orang-orang yang telah Engkau beri nikmat, bukan jalan mereka yang dimurkai dan bukan pula jalan mereka yang sesat.",
  },
  {
    title: "Surat Al-Ikhlas",
    note: "QS 112:1–4",
    repetition: "3×",
    arabic:
      "بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ ۞ قُلْ هُوَ اللّٰهُ اَحَدٌ ۞ اَللّٰهُ الصَّمَدُ ۞ لَمْ يَلِدْ وَلَمْ يُوْلَدْ ۞ وَلَمْ يَكُنْ لَّهٗ كُفُوًا اَحَدٌ",
    latin:
      "Bismillāhir-raḥmānir-raḥīm. Qul huwallāhu aḥad. Allāhuṣ-ṣamad. Lam yalid wa lam yūlad. Wa lam yakul lahū kufuwan aḥad.",
    meaning:
      "Dengan nama Allah Yang Maha Pengasih, Maha Penyayang. Katakanlah: Dialah Allah Yang Maha Esa. Allah tempat meminta segala sesuatu. Dia tidak beranak dan tidak pula diperanakkan. Dan tidak ada sesuatu yang setara dengan Dia.",
  },
  {
    title: "Tahlil dan takbir",
    note: "Dzikir",
    repetition: "1×",
    arabic: "لَا إِلٰهَ إِلَّا اللهُ وَاللهُ أَكْبَرُ",
    latin: "Lā ilāha illallāhu wallāhu akbar.",
    meaning: "Tiada Tuhan yang berhak disembah selain Allah, dan Allah Maha Besar.",
  },
  {
    title: "Surat Al-Falaq",
    note: "QS 113:1–5",
    repetition: "1×",
    arabic:
      "بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ ۞ قُلْ اَعُوْذُ بِرَبِّ الْفَلَقِ ۞ مِنْ شَرِّ مَا خَلَقَ ۞ وَمِنْ شَرِّ غَاسِقٍ اِذَا وَقَبَ ۞ وَمِنْ شَرِّ النَّفّٰثٰتِ فِى الْعُقَدِ ۞ وَمِنْ شَرِّ حَاسِدٍ اِذَا حَسَدَ",
    latin:
      "Bismillāhir-raḥmānir-raḥīm. Qul a‘ūżu birabbil-falaq. Min syarri mā khalaq. Wa min syarri gāsiqin iżā waqab. Wa min syarrin-naffāṡāti fil-‘uqad. Wa min syarri ḥāsidin iżā ḥasad.",
    meaning:
      "Dengan nama Allah Yang Maha Pengasih, Maha Penyayang. Katakanlah: Aku berlindung kepada Tuhan yang menguasai subuh, dari kejahatan makhluk yang Dia ciptakan, dari kejahatan malam apabila telah gelap gulita, dari kejahatan perempuan penyihir yang meniup pada buhul-buhul, dan dari kejahatan orang yang dengki apabila dia dengki.",
  },
  {
    title: "Tahlil dan takbir",
    note: "Dzikir",
    repetition: "1×",
    arabic: "لَا إِلٰهَ إِلَّا اللهُ وَاللهُ أَكْبَرُ",
    latin: "Lā ilāha illallāhu wallāhu akbar.",
    meaning: "Tiada Tuhan yang berhak disembah selain Allah, dan Allah Maha Besar.",
  },
  {
    title: "Surat An-Nas",
    note: "QS 114:1–6",
    repetition: "1×",
    arabic:
      "بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ ۞ قُلْ اَعُوْذُ بِرَبِّ النَّاسِ ۞ مَلِكِ النَّاسِ ۞ اِلٰهِ النَّاسِ ۞ مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۞ الَّذِيْ يُوَسْوِسُ فِيْ صُدُوْرِ النَّاسِ ۞ مِنَ الْجِنَّةِ وَالنَّاسِ",
    latin:
      "Bismillāhir-raḥmānir-raḥīm. Qul a‘ūżu birabbin-nās. Malikin-nās. Ilāhin-nās. Min syarril-waswāsil-khannās. Allażī yuwaswisu fī ṣudūrin-nās. Minal-jinnati wan-nās.",
    meaning:
      "Dengan nama Allah Yang Maha Pengasih, Maha Penyayang. Katakanlah: Aku berlindung kepada Tuhan manusia, Raja manusia, sembahan manusia, dari kejahatan bisikan setan yang bersembunyi, yang membisikkan kejahatan ke dalam dada manusia, dari golongan jin dan manusia.",
  },
  {
    title: "Tahlil dan takbir",
    note: "Dzikir",
    repetition: "1×",
    arabic: "لَا إِلٰهَ إِلَّا اللهُ وَاللهُ أَكْبَرُ",
    latin: "Lā ilāha illallāhu wallāhu akbar.",
    meaning: "Tiada Tuhan yang berhak disembah selain Allah, dan Allah Maha Besar.",
  },
  {
    title: "Ayat Kursi",
    note: "QS. Al-Baqarah: 255",
    repetition: "1×",
    arabic:
      "اَللّٰهُ لَا إِلٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّوْمُ لَا تَأْخُذُهٗ سِنَةٌ وَّلَا نَوْمٌ لَهٗ مَا فِى السَّمٰوٰتِ وَمَا فِى الْأَرْضِ مَنْ ذَا الَّذِيْ يَشْفَعُ عِنْدَهٗ إِلَّا بِإِذْنِهٖ يَعْلَمُ مَا بَيْنَ أَيْدِيْهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيْطُوْنَ بِشَيْءٍ مِّنْ عِلْمِهٖ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمٰوٰتِ وَالْأَرْضَ وَلَا يَئُوْدُهٗ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيْمُ",
    latin:
      "Allāhu lā ilāha illā huwal-ḥayyul-qayyūm. Lā ta’khużuhū sinatuw wa lā nawm. Lahū mā fis-samāwāti wa mā fil-arḍ. Man żallażī yasyfa‘u ‘indahū illā bi’iżnih. Ya‘lamu mā baina aidīhim wa mā khalfahum. Wa lā yuḥīṭūna bisyai’im min ‘ilmihī illā bimā syā’. Wasi‘a kursiyyuhus-samāwāti wal-arḍ. Wa lā ya’ūduhū ḥifẓuhumā wa huwal-‘aliyyul-‘aẓīm.",
    meaning:
      "Allah, tidak ada Tuhan selain Dia. Yang Mahahidup, Yang terus-menerus mengurus makhluk-Nya. Dia tidak mengantuk dan tidak tidur. Milik-Nya apa yang ada di langit dan di bumi. Tidak ada yang dapat memberi syafaat di sisi-Nya tanpa izin-Nya. Dia mengetahui apa yang di hadapan dan di belakang mereka. Mereka tidak mengetahui sesuatu apa pun tentang ilmu-Nya kecuali apa yang Dia kehendaki. Kursi-Nya meliputi langit dan bumi. Dia tidak merasa berat memelihara keduanya. Dia Mahatinggi, Mahaagung.",
  },
  {
    title: "Istighfar",
    note: "Dzikir",
    repetition: "3×",
    arabic: "أَسْتَغْفِرُ اللهَ الْعَظِيْمَ",
    latin: "Astaghfirullāhal-‘aẓīm.",
    meaning: "Aku memohon ampun kepada Allah Yang Mahaagung.",
  },
  {
    title: "Bacaan tahlil",
    note: "Dzikir",
    repetition: "100×",
    arabic: "لَا إِلٰهَ إِلَّا اللهُ",
    latin: "Lā ilāha illallāh.",
    meaning: "Tiada Tuhan yang berhak disembah selain Allah.",
  },
  {
    title: "Shalawat",
    note: "Shalawat",
    repetition: "2×",
    arabic: "اللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَسَلِّمْ",
    latin: "Allāhumma ṣalli ‘alā sayyidinā Muḥammad wa sallim.",
    meaning: "Ya Allah, limpahkanlah rahmat dan keselamatan kepada junjungan kami Nabi Muhammad.",
  },
  {
    title: "Tasbih",
    note: "Tasbih",
    repetition: "33×",
    arabic: "سُبْحَانَ اللهِ وَبِحَمْدِهِ سُبْحَانَ اللهِ الْعَظِيْمِ",
    latin: "Subḥānallāhi wa biḥamdih, subḥānallāhil-‘aẓīm.",
    meaning: "Mahasuci Allah dan segala puji bagi-Nya. Mahasuci Allah Yang Mahaagung.",
  },
];

const closingPrayer: TahlilReading[] = [
  {
    title: "Doa memohon ampun bagi ahli kubur",
    note: "Doa",
    repetition: "1×",
    arabic:
      "اللّٰهُمَّ اغْفِرْ لَهُمْ وَارْحَمْهُمْ وَعَافِهِمْ وَاعْفُ عَنْهُمْ، اللّٰهُمَّ أَنْزِلِ الرَّحْمَةَ وَالْمَغْفِرَةَ عَلَى أَهْلِ الْقُبُوْرِ مِنْ أَهْلِ لَا إِلٰهَ إِلَّا اللهُ مُحَمَّدٌ رَّسُوْلُ اللهِ",
    latin:
      "Allāhummaghfir lahum warḥamhum wa ‘āfihim wa‘fu ‘anhum. Allāhumma anzilir-raḥmata wal-maghfirata ‘alā ahlil-qubūri min ahli lā ilāha illallāhu Muḥammadur-rasūlullāh.",
    meaning:
      "Ya Allah, ampunilah mereka, rahmatilah mereka, sejahterakanlah mereka, dan maafkanlah mereka. Ya Allah, turunkanlah rahmat dan ampunan kepada para penghuni kubur yang mengucapkan, ‘Tiada Tuhan selain Allah, Muhammad adalah utusan Allah.’",
  },
  {
    title: "Doa kebaikan dunia dan akhirat",
    note: "Doa",
    repetition: "1×",
    arabic:
      "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    latin:
      "Rabbanā ātinā fid-dunyā ḥasanah, wa fil-ākhirati ḥasanah, wa qinā ‘ażāban-nār.",
    meaning:
      "Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat, serta lindungilah kami dari azab neraka.",
  },
];

export default function TahlilPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-5 rounded-[14px] bg-[#171e26] p-3 text-[#f0f4f6] md:p-5">
      <header className="px-2 py-3 md:px-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#bac8d1]">
          <BookOpenText className="h-4 w-4" aria-hidden="true" />
          Panduan bacaan
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">Tahlil</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[#d5dfe5]">
          Rangkaian dzikir dan doa, lengkap dengan tulisan Arab, latin, dan terjemahan.
        </p>
        <div className="mt-4 flex items-start gap-3 rounded-[10px] border border-[#36434f] bg-[#202a33] p-4 text-sm leading-6 text-[#d5dfe5]">
          <HeartHandshake className="mt-0.5 h-5 w-5 shrink-0 text-[#c3d7e4]" aria-hidden="true" />
          <p>
            Susunan dan jumlah bacaan dapat berbeda menurut tradisi setempat.
            Panduan ini mengikuti salah satu susunan tahlil yang umum digunakan.
          </p>
        </div>
      </header>

      <TahlilReader readings={readings} prayers={closingPrayer} />

      <footer className="rounded-[10px] border border-[#35424e] bg-[#202a33] p-4 text-sm leading-6 text-[#c8d3db] md:p-5">
        <p className="font-semibold text-white">Rujukan susunan</p>
        <p className="mt-1">
          Disarikan dari susunan Tahlil dan Doa Arwah Quran NU Online. Bacaan
          Al-Qur’an pada halaman ini ditampilkan sebagai panduan; silakan
          merujuk mushaf untuk memastikan tajwid dan makhraj.
        </p>
        <a
          className="mt-2 inline-flex min-h-11 items-center font-semibold text-[#c5deed] underline underline-offset-4 hover:text-white"
          href="https://quran.nu.or.id/tahlil"
          target="_blank"
          rel="noreferrer"
        >
          Buka rujukan Tahlil lengkap ↗
        </a>
      </footer>
    </div>
  );
}
