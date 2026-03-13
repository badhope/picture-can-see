/**
 * 属性计算服务
 * 负责所有与属性相关的计算逻辑
 */

class AttributeService {
    static effects = {
        intelligence: {
            examSuccess: (value) => 0.5 + (value / 20),
            careerGrowth: (value) => value * 0.1,
            unlockChance: (value) => Math.max(0, (value - 5) * 0.05),
            learningSpeed: (value) => 0.3 + (value / 20)
        },
        constitution: {
            maxHealth: (value) => 50 + (value * 5),
            diseaseResist: (value) => 0.3 + (value / 25),
            healthDecay: (value) => Math.max(0.1, 0.5 - (value * 0.03)),
            recoveryRate: (value) => 0.2 + (value / 20)
        },
        charisma: {
            socialSuccess: (value) => 0.4 + (value / 20),
            relationshipGain: (value) => value * 0.2,
            npcAttitude: (value) => (value - 5) * 5,
            leadership: (value) => 0.3 + (value / 25)
        },
        luck: {
            randomEventRate: (value) => 0.02 + (value * 0.01),
            rareEventChance: (value) => Math.max(0, (value - 3) * 0.02),
            positiveBias: (value) => (value - 5) * 0.1,
            criticalHit: (value) => (value - 5) * 0.02
        },
        morality: {
            optionPool: (value) => Math.floor(value / 3),
            npcTrust: (value) => (value - 5) * 3,
            endingBonus: (value) => value * 10,
            specialEncounter: (value) => (value - 3) * 0.015
        }
    };

    static calculateExamSuccess(player) {
        const intel = player.attributes.intelligence;
        return this.effects.intelligence.examSuccess(intel);
    }

    static calculateMaxHealth(player) {
        const con = player.attributes.constitution;
        const base = this.effects.constitution.maxHealth(con);
        const ageFactor = Math.max(0.5, 1 - (player.age * 0.005));
        return Math.round(base * ageFactor);
    }

    static calculateDiseaseResist(player) {
        const con = player.attributes.constitution;
        return this.effects.constitution.diseaseResist(con);
    }

    static calculateSocialSuccess(player) {
        const cha = player.attributes.charisma;
        return this.effects.charisma.socialSuccess(cha);
    }

    static calculateRandomEventChance(player) {
        const luck = player.attributes.luck;
        return this.effects.luck.randomEventRate(luck);
    }

    static calculatePositiveEventChance(player) {
        const luck = player.attributes.luck;
        return 0.3 + (luck - 5) * 0.05;
    }

    static calculateNegativeEventChance(player) {
        const luck = player.attributes.luck;
        return 0.4 - (luck - 5) * 0.05;
    }

    static applyEffects(player, effects) {
        const result = { ...effects };
        
        for (const [key, value] of Object.entries(effects)) {
            if (key === 'money' || key === 'cost') {
                continue;
            }
            
            if (typeof value === 'number' && player.attributes[key] !== undefined) {
                const newValue = player.attributes[key] + value;
                player.attributes[key] = Math.max(1, Math.min(10, newValue));
            }
        }
        
        if (effects.money) {
            player.money = Math.max(0, player.money + effects.money);
            player.totalMoney += effects.money;
        }
        
        return result;
    }

    static getAttributeDisplayValue(value) {
        const labels = {
            1: '极低',
            2: '很低',
            3: '较低',
            4: '略低',
            5: '一般',
            6: '略高',
            7: '较高',
            8: '很高',
            9: '极高',
            10: '卓越'
        };
        return labels[value] || '一般';
    }

    static getAttributeProgress(value) {
        return (value / 10) * 100;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AttributeService;
}
