export default class PerksManager {
  perks = [
    {
      name: "High burn",
      description: "You grow once every time you eat 2 foods.",
      id: "multifoods",
      onApply: () => {},
      used: 0,
      canBeUsed: Infinity
    },
    {
      name: "Trim",
      description: "Remove 25% of your body. Minimum is 1 segment removed.",
      id: "half",
      onApply: () => {},
      used: 0,
      canBeUsed: Infinity
    },
    {
      name: "Moreee",
      description: "Spawn +1 food.",
      id: "+food",
      onApply: () => {},
      used: 0,
      canBeUsed: Infinity
    },
    {
      name: "Fast food",
      description: "Food value doubles but gets removed automatically if not eaten after 8 seconds.",
      id: "fastfood",
      onApply: () => {},
      used: 0,
      canBeUsed: Infinity
    },
    {
      name: "Fast snake",
      description: "Snake speed increases by 20%. You'll be able to eat faster",
      id: "fastsnake",
      onApply: () => {},
      used: 0,
      canBeUsed: 4
    },
    {
      name: "More space",
      description: "Space increases by a random amount. You'll have more room to grow.",
      id: "+space",
      onApply: () => {},
      used: 0,
      canBeUsed: 5
    }
  ];

  constructor() {
    this.perksContainer = document.querySelector(".perks");

    this.perkLeftButton = this.perksContainer.querySelector(".perk-left");
    this.perkRightButton = this.perksContainer.querySelector(".perk-right");

    this.perkLeftTitle = this.perkLeftButton.querySelector(".perk-title");
    this.perkRightTitle = this.perkRightButton.querySelector(".perk-title");

    this.perkLeftDescription = this.perkLeftButton.querySelector(".perk-description");
    this.perkRightDescription = this.perkRightButton.querySelector(".perk-description");

    this.perksButton = this.perksContainer.querySelector(".perks-button");
  }

  display(callback) {
    var perkLeft,
      perkRight,
      selected = "",
      visitedIndex = -1;

    for (var i = 0; i < 10000; i++) {
      var index = Math.floor(Math.random() * this.perks.length);
      if (index == visitedIndex) continue;

      if (perkLeft != null && perkRight != null) break;

      if (perkLeft == null) {
        if (this.perks[index].canBeUsed > this.perks[index].used) {
          perkLeft = this.perks[index];
          visitedIndex = index;
          continue;
        }
      } else if (perkRight == null) {
        if (this.perks[index].canBeUsed > this.perks[index].used) {
          perkRight = this.perks[index];
          continue;
        }
      } else {
        break;
      }
    }

    if (perkLeft == null || perkRight == null) {
      console.log("no more powerups");
    }

    this.perkLeftButton.classList.remove("selected");
    this.perkRightButton.classList.remove("selected");

    this.perkLeftTitle.innerHTML = perkLeft.name;
    this.perkRightTitle.innerHTML = perkRight.name;

    this.perkLeftDescription.innerHTML = perkLeft.description;
    this.perkRightDescription.innerHTML = perkRight.description;

    this.perkLeftButton.onclick = () => {
      selected = "left";
      this.perkLeftButton.classList.add("selected");
      this.perkRightButton.classList.remove("selected");
    };

    this.perkRightButton.onclick = () => {
      selected = "right";
      this.perkLeftButton.classList.remove("selected");
      this.perkRightButton.classList.add("selected");
    };

    this.perksButton.onclick = () => {
      if (selected == "right") {
        perkRight.used++;
        perkRight.onApply();
      } else if (selected == "left") {
        perkLeft.used++;
        perkLeft.onApply();
      } else {
        window.alert("CHOOSE ONE!");
        return;
      }

      callback();
      this.perksContainer.classList.remove("active");
    };

    this.perksContainer.classList.add("active");
  }

  reset() {
    this.perks.forEach((perk) => {
      perk.used = 0;
    });
  }
}
