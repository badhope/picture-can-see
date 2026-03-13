/**
 * 结局计算服务
 */

class EndingService {
    constructor(endingsData) {
        this.endings = endingsData;
    }

    calculateEnding(player) {
        const scores = this.calculateScores(player);
        
        const scoresByType = this.categorizeByType(scores);
        
        const result = this.determineEndingType(scoresByType, player);
        
        return {
            type: result.type,
            name: this.endings.types[result.type].name,
            icon: this.endings.types[result.type].icon,
            description: this.getEndingText(result.type, player),
            score: scores.total,
            details: scoresByType,
            summary: this.generateSummary(scoresByType, player)
        };
    }

    calculateScores(player) {
        let totalScore = 0;
        const breakdown = {};

        const attrWeights = {
            intelligence: 1.5,
            constitution: 2.0,
            charisma: 1.0,
            luck: 1.2,
            morality: 1.0
        };

        for (const [attr, weight] of Object.entries(attrWeights)) {
            const value = player.attributes[attr] || 5;
            breakdown[attr] = Math.round(value * weight * 10);
            totalScore += breakdown[attr];
        }

        if (player.totalMoney) {
            const moneyScore = Math.min(500, Math.floor(player.totalMoney / 10000));
            breakdown.money = moneyScore;
            totalScore += moneyScore;
        }

        const careerScore = this.calculateCareerScore(player);
        breakdown.career = careerScore;
        totalScore += careerScore;

        const familyScore = this.calculateFamilyScore(player);
        breakdown.family = familyScore;
        totalScore += familyScore;

        const healthScore = Math.round((player.health / player.maxHealth) * 100);
        breakdown.health = healthScore;
        totalScore += healthScore;

        const ageScore = Math.min(200, player.age * 2);
        breakdown.longevity = ageScore;
        totalScore += ageScore;

        return { total: totalScore, breakdown };
    }

    calculateCareerScore(player) {
        let score = 0;
        
        if (player.hasFlag('career_success')) score += 150;
        if (player.hasFlag('entrepreneur')) score += 200;
        if (player.hasFlag('professional')) score += 150;
        if (player.hasFlag('government_official')) score += 150;
        
        if (player.hasFlag('work_experience_abroad')) score += 50;
        if (player.hasFlag('promoted')) score += 30;
        
        return score;
    }

    calculateFamilyScore(player) {
        let score = 0;
        
        if (player.hasFlag('married')) score += 100;
        if (player.hasFlag('has_children')) score += 100;
        if (player.hasFlag('happy_family')) score += 150;
        
        if (player.hasFlag('good_relationship_parents')) score += 50;
        
        return score;
    }

    categorizeByType(scores) {
        return {
            career: scores.breakdown.intelligence + scores.breakdown.charisma + scores.breakdown.career,
            wealth: scores.breakdown.money + scores.breakdown.luck,
            health: scores.breakdown.constitution + scores.breakdown.health + scores.breakdown.longevity,
            relationships: scores.breakdown.charisma + scores.breakdown.family,
            moral: scores.breakdown.morality
        };
    }

    determineEndingType(scoresByType, player) {
        const { career, wealth, health, relationships, moral } = scoresByType;

        const thresholds = {
            career: 150,
            wealth: 100,
            health: 100,
            relationships: 100,
            moral: 80
        };

        const highTypes = [];
        if (career >= thresholds.career) highTypes.push('career');
        if (wealth >= thresholds.wealth) highTypes.push('wealth');
        if (health >= thresholds.health) highTypes.push('health');
        if (relationships >= thresholds.relationships) highTypes.push('relationships');
        if (moral >= thresholds.moral) highTypes.push('moral');

        if (highTypes.length >= 4 && career >= 200 && wealth >= 150) {
            return { type: 'legend' };
        }
        if (career >= 180) return { type: 'career' };
        if (wealth >= 150) return { type: 'wealth' };
        if (relationships >= 150) return { type: 'family' };
        if (health >= 120) return { type: 'longevity' };
        if (moral >= 100) return { type: 'saint' };
        
        if (player.age >= 80) return { type: 'elder' };
        if (player.health <= 0) return { type: 'tragedy' };
        
        return { type: 'ordinary' };
    }

    getEndingText(type, player) {
        const endings = this.endings.endings[type] || ['你的人生走到了尽头。'];
        const randomIndex = Math.floor(Math.random() * endings.length);
        
        let text = endings[randomIndex];
        
        text = text.replace('{age}', player.age);
        text = text.replace('{year}', player.year);
        text = text.replace('{money}', player.totalMoney || 0);
        
        return text;
    }

    generateSummary(scoresByType, player) {
        const { career, wealth, health, relationships, moral } = scoresByType;
        
        const highlights = [];
        
        if (career > 150) highlights.push('事业有成');
        if (wealth > 100) highlights.push('财运亨通');
        if (health > 100) highlights.push('身体健康');
        if (relationships > 100) highlights.push('家庭和睦');
        if (moral > 80) highlights.push('德高望重');
        
        if (player.age > 80) highlights.push('长寿');
        
        return highlights.length > 0 ? highlights.join('、') : '平凡一生';
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = EndingService;
}
