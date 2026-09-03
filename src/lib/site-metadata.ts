export type SiteMetadata = {
  name: string;
  title: string;
  description: string;
  shortTitle?: string;
  url: string;
  locale: string;
  creator: string;
  twitterHandle?: string;
  keywords: string[];
};

export const siteMetadata: SiteMetadata = {
  name: "prava.ge",
  title: "prava.ge | მართვის მოწმობის თეორია საქართველოში",
  shortTitle: "prava.ge",
  description:
    "საქართველოს მართვის მოწმობის თეორიის სავარჯიშო ბილეთები, თემები და გამოცდის სიმულაცია. ქართულად, ინგლისურად და რუსულად.",
  url: "https://prava.ge",
  locale: "ka_GE",
  creator: "prava.ge",
  twitterHandle: "@prava.ge",
  keywords: [
    "მართვის მოწმობა",
    "თეორია",
    "სავარჯიშო ბილეთები",
    "გამოცდა",
    "driving theory Georgia",
    "права Грузия",
    "prava.ge",
    "პრავა",
  ],
};
