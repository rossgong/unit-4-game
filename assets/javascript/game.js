var characterStatList = [
	["Beat", 6, 6, 100, "assets/images/beat.png"],
	["Goji", 4, 8, 200, "assets/images/goji.png"],
	["Jazz", 7, 6, 80, "assets/images/jazz.png"],
	["Poison Jam", 5, 9, 75, "assets/images/poison.png"]
]

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
		this.hpLabel = $("<p>", { class: "char-label-hp" }).text(this.hp)
		label.append($("<p>", { class: "char-label-name" }).text(this.name));
		label.append(this.hpLabel);
		return div.append(label);;
	}

	this.card = this.constructCharacterCard(index);

	this.setAsEnemy = function () {
		this.card.attr("class", "char-card enemy-card")
	};

	this.updateIndex = function (index) {
		this.card.attr("value", index);
	};

	this.updateHPHTML = function () {
		this.hpLabel.html(this.hp);
		if (this.hp < 50) {
			this.hpLabel.css("color", "red");
		}
		console.log(this);
	};

	this.attack = function (defender) {
		defender.hp -= this.attackStat;
		this.attackStat += this.baseAttack;

		if (defender.isAlive()) {
			this.hp -= defender.counterStat;
		}

		defender.updateHPHTML();
		this.updateHPHTML();
	};

	this.isAlive = function () {
		return this.hp > 0;
	};
}

$(document).ready(function () {
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
			this.playerCharacter.card.appendTo("#player-char");
		},

		setDefender: function (index) {
			this.currentDefender = this.removeCharacter(index);

			this.currentDefender.card.appendTo("#defender-char");
		},

		removeDefender: function () {
			this.currentDefender.card.remove();
			this.currentDefender = {};			
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
		},

		intializeGame: function (characterStats) {
			for (var i = 0; i < characterStats.length; i++) {
				this.characterList.push(new Character(characterStats[i][0], characterStats[i][1], characterStats[i][2], characterStats[i][3], characterStats[i][4], i))
			};

			this.initializeHTML();
		}
	}

	game.intializeGame(characterStatList);

	$(".char-card").on("click", function (event) {
		var index = this.getAttribute("value");
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
	});

	$("#attack-button").on("click", function (event) {
		if (game.hasChosenCharacter() && game.hasDefender()) {
			game.playerCharacter.attack(game.currentDefender);

			if (!game.currentDefender.isAlive()) {
				game.removeDefender();
			}
		}
	});
	console.log(game.characterList);



});
