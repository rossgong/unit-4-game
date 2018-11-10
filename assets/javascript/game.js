
/*
	Laid out like this
	["Character Name", baseAttackStat, counterStat, hp, "path/to/characterImage.png"]
	To add more characters, just add info to this list.
*/
var characterStatList = [
	["Beat", 6, 30, 100, "assets/images/beat.png"],
	["Goji", 4, 10, 200, "assets/images/goji.png"],
	["Jazz", 7, 35, 80, "assets/images/jazz.png"],
	["Poison Jam", 5, 10, 75, "assets/images/poison.png"]
]

// function createReset

function Character(name, attack, counter, hp, image, index) {

	this.name = name;
	this.baseAttack = attack;
	this.attackStat = attack;
	this.counterStat = counter;
	this.hp = hp;
	this.image = image;

	//created for ease of updating
	this.hpLabel = {};

	/*
		Creates card based on this characters properties. Has a basic picture, and label with health and attack.
		Uses index to reference in characterList later
	*/
	this.constructCharacterCard = function (index) {
		//Containing div for the image and the label		
		var div = $("<div>", { class: "char-card player-card", value: index });
		div.append($("<img>", { class: "char-img", src: this.image, alt: this.name }));

		//Label div contains the name and the HP
		var label = $("<div>", { class: "char-label" });
		label.append($("<p>", { class: "char-label-name" }).text(this.name));

		this.hpLabel = $("<p>", { class: "char-label-hp" }).text(this.hp)
		label.append(this.hpLabel);
		return div.append(label);
	}

	this.card = this.constructCharacterCard(index);

	this.setAsEnemy = function () {
		this.card.attr("class", "char-card enemy-card")
	};

	this.updateIndex = function (index) {
		this.card.attr("value", index);
	};

	this.updateHPHTML = function () {
		this.hpLabel.text(this.hp);
		if (this.hp < 50) {
			this.hpLabel.css("color", "red");
			if (this.hp < 0) {
				this.hpLabel.text("0");
			}
		}
	};

	this.attack = function (defender) {
		if (this.isAlive()) {
			defender.hp -= this.attackStat;
			this.attackStat += this.baseAttack;

			if (defender.isAlive()) {
				this.hp -= defender.counterStat;
			}

			defender.updateHPHTML();
			this.updateHPHTML();
		}
	};

	this.isAlive = function () {
		return this.hp > 0;
	};
}

var game = {
	// Starts off as a list of all chacters but becomes list of enemies once a PC is chosen
	characterList: [],
	playerCharacter: {},
	currentDefender: {},

	/*
		Returns if the player has chosen their fighter yet
	*/
	hasChosenCharacter: function () {
		return this.playerCharacter.name !== undefined;
	},

	hasDefender: function () {
		return this.currentDefender.name !== undefined;
	},

	setChoosenCharacter: function (index) {
		this.playerCharacter = this.removeCharacter(index);
		this.characterList.forEach(element => {
			element.setAsEnemy();
		});

		$("#player-blank").remove();
		this.playerCharacter.card.appendTo("#player-char");

		$("#char-select-label").text("Select your enemy")
		$("#enemy-blank").append($("<div>", { class: "char-label" }).append($("<p>", { class: "char-label-name" }).text("SELECT YOUR ENEMY")));
	},

	setDefender: function (index) {
		this.currentDefender = this.removeCharacter(index);

		if (this.characterList.length == 0) {
			var blank = $("#enemy-blank");
			blank.css("opacity", 0);
			$("#enemy-blank").appendTo("#char-select");
		} else {
			$("#enemy-blank").remove();
		}

		this.currentDefender.card.appendTo("#defender-char");
	},

	removeDefender: function () {
		this.currentDefender.card.remove();
		this.currentDefender = {};
		this.createBlank(false).appendTo("#defender-char");
	},

	removeCharacter: function (index) {
		var char = this.characterList[index];
		this.characterList.splice(index, 1);
		for (var i = 0; i < this.characterList.length; i++) {
			this.characterList[i].updateIndex(i);
		}
		return char;
	},

	initializeHTML: function () {
		var charSelect = $("#char-select").html("");
		for (var i = 0; i < this.characterList.length; i++) {
			$("#char-select").append(this.characterList[i].card);
		}
		$("#player-char").append(this.createBlank(true));
		var blank = this.createBlank(false);
		blank.find("div").remove();

		$("#defender-char").append(blank);
	},

	createBlank: function (isPlayer) {
		//Containing div for the image and the label		
		var cardClass = "char-card ";
		var cardID = "";
		if (isPlayer) {
			cardClass += "player-card";
			cardID = "player-blank"
		} else {
			cardClass += "enemy-card";
			cardID = "enemy-blank"
		}
		var div = $("<div>", { class: cardClass, id: cardID, value: -1 });
		div.append($("<img>", { class: "char-img", src: "assets/images/blank.png", alt: "blank" }));

		div.append($("<div>", { class: "char-label" }).append($("<p>", { class: "char-label-name" }).text("SELECT A CHARACTER!")));
		return div;
	},

	intializeGame: function (characterStats) {
		this.characterList = [];
		this.playerCharacter = {};
		this.currentDefender = {};

		for (var i = 0; i < characterStats.length; i++) {
			this.characterList.push(new Character(characterStats[i][0], characterStats[i][1], characterStats[i][2], characterStats[i][3], characterStats[i][4], i))
		};

		this.initializeHTML();
	},

	lose: function () {
		var resultsDiv = $("#game-container");

		resultsDiv.html("<h1>You lose</h1>");
		resultsDiv.append("<p>Try again next time " + this.playerCharacter.name + "</p>");
		// resultsDiv.append(this.playerCharacter.constructCharacterCard());
	},

	win: function () {
		var resultsDiv = $("#game-container");

		resultsDiv.html("<h1>You win</h1>");
		resultsDiv.append("<hr><p>" + this.playerCharacter.name + ", you might be the leader of the Tokyo underground but will you be able to defend your turf? I can assure you that these cats will be back, and they will not crumble under the pressure. Will you?</p>");
		// resultsDiv.append(this.playerCharacter.constructCharacterCard());
	}
}

$(document).ready(function () {
	game.intializeGame(characterStatList);

	$(".char-card").on("click", function (event) {
		var index = this.getAttribute("value");

		//blanks have a value of -1 to prevent anything happening when they are clicked.
		if (index != -1) {
			var char = game.characterList[index];

			if (game.hasChosenCharacter()) {
				if (char !== game.playerCharacter) {
					if (!game.hasDefender()) {
						game.setDefender(index);
					}
				}
			} else {
				game.setChoosenCharacter(index);
			}
		}
	});

	$("#attack-button").on("click", function (event) {
		if (game.hasChosenCharacter() && game.hasDefender()) {
			game.playerCharacter.attack(game.currentDefender);

			if (!game.playerCharacter.isAlive()) {
				game.lose();
			}
			
			if (!game.currentDefender.isAlive()) {
				game.removeDefender();
			}

			if (game.characterList.length === 0) {
				game.win();
			}
		}
	});
});
