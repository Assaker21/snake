export default class LevelManager {
  onReachNewLevel = (level) => {};

  constructor() {
    this.level = 0;
    this.levelDiv = document.querySelector(".level");
    this.levelDiv.innerHTML = `lvl ${this.level}`;
  }

  update(score) {
    var currLevel = this.getLevelFromScore(score);
    const slider = document.querySelector(".slider-value");

    var start = this.getStartScoreOfLevel(currLevel);
    var end = this.getEndScoreOfLevelKnowingStart(currLevel, start);

    if (this.level != 0) slider.style.width = `${(100 * (score - start)) / (end - start)}%`;
    else {
      slider.style.width = "0px";
    }

    if (currLevel != this.level) {
      this.level = currLevel;
      if (this.level != 0 && this.level != 1) this.onReachNewLevel(this.level);
      this.levelDiv.innerHTML = `lvl ${this.level}`;
    }
  }

  reset() {
    this.level = 0;
    this.update(0);
    this.levelDiv.innerHTML = `lvl ${this.level}`;
  }

  getLevelFromScore(score) {
    var last = 0;
    for (var i = 0; i < 200; i++) {
      var start = this.getStartScoreOfLevelKnowingLast(i, last);
      var end = this.getEndScoreOfLevelKnowingStart(i, start);

      last = start;

      if (score >= start && score < end) {
        return i;
      }
    }

    return Infinity;
  }

  getStartScoreOfLevel(level) {
    if (level <= 0) return 0;

    return /*Math.floor(level * 2.5)*/ -1 / (0.001 * level + 0.02) + 50 + this.getStartScoreOfLevel(level - 1);
  }

  getStartScoreOfLevelKnowingLast(level, lastLevelStartScore) {
    if (level <= 0) return 0;

    return /*Math.floor(level * 2.5)*/ -1 / (0.001 * level + 0.02) + 50 + lastLevelStartScore;
  }

  getEndScoreOfLevel(level) {
    return this.getStartScoreOfLevel(level + 1);
  }

  getEndScoreOfLevelKnowingStart(level, lastLevelStartScore) {
    return this.getStartScoreOfLevelKnowingLast(level + 1, lastLevelStartScore);
  }
}
