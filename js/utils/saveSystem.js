/**
 * 存档系统
 * 负责游戏的保存和读取功能
 */

const SaveSystem = {
    /**
     * 保存游戏
     * @param {Object} saveData - 存档数据
     * @param {number} slot - 存档槽位 (0-2)
     * @returns {boolean} 是否保存成功
     */
    save: function(saveData, slot = 0) {
        try {
            const saves = this.getAllSaves();
            saves[slot] = {
                timestamp: Date.now(),
                data: saveData
            };
            
            localStorage.setItem(CONFIG.SAVE.key, JSON.stringify(saves));
            return true;
        } catch (e) {
            console.error('保存失败:', e);
            return false;
        }
    },

    /**
     * 读取存档
     * @param {number} slot - 存档槽位
     * @returns {Object|null} 存档数据，如果没有则返回null
     */
    load: function(slot = 0) {
        try {
            const saves = this.getAllSaves();
            if (saves[slot] && saves[slot].data) {
                return saves[slot].data;
            }
            return null;
        } catch (e) {
            console.error('读取失败:', e);
            return null;
        }
    },

    /**
     * 获取所有存档
     * @returns {Array} 存档数组
     */
    getAllSaves: function() {
        try {
            const data = localStorage.getItem(CONFIG.SAVE.key);
            return data ? JSON.parse(data) : [null, null, null];
        } catch (e) {
            return [null, null, null];
        }
    },

    /**
     * 删除存档
     * @param {number} slot - 存档槽位
     * @returns {boolean} 是否删除成功
     */
    deleteSave: function(slot = 0) {
        try {
            const saves = this.getAllSaves();
            saves[slot] = null;
            localStorage.setItem(CONFIG.SAVE.key, JSON.stringify(saves));
            return true;
        } catch (e) {
            console.error('删除失败:', e);
            return false;
        }
    },

    /**
     * 检查是否有存档
     * @returns {boolean} 是否有存档
     */
    hasSave: function() {
        const saves = this.getAllSaves();
        return saves.some(save => save !== null);
    },

    /**
     * 获取最新存档
     * @returns {Object|null} 最新存档数据
     */
    getLatestSave: function() {
        const saves = this.getAllSaves();
        let latest = null;
        let latestTime = 0;
        
        saves.forEach(save => {
            if (save && save.timestamp > latestTime) {
                latest = save;
                latestTime = save.timestamp;
            }
        });
        
        return latest ? latest.data : null;
    },

    /**
     * 格式化存档时间
     * @param {number} timestamp - 时间戳
     * @returns {string} 格式化后的时间字符串
     */
    formatTime: function(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        // 小于1小时
        if (diff < 3600000) {
            const minutes = Math.floor(diff / 60000);
            return minutes <= 1 ? '刚刚' : `${minutes}分钟前`;
        }
        
        // 小于24小时
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            return `${hours}小时前`;
        }
        
        // 小于7天
        if (diff < 604800000) {
            const days = Math.floor(diff / 86400000);
            return `${days}天前`;
        }
        
        // 超过7天
        return date.toLocaleDateString('zh-CN');
    },

    /**
     * 导出存档（JSON格式）
     * @param {Object} saveData - 存档数据
     * @returns {string} JSON字符串
     */
    exportSave: function(saveData) {
        return JSON.stringify(saveData, null, 2);
    },

    /**
     * 导入存档（从JSON）
     * @param {string} jsonString - JSON字符串
     * @returns {Object|null} 解析后的存档数据
     */
    importSave: function(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            // 验证存档数据格式
            if (data.version && data.player) {
                return data;
            }
            return null;
        } catch (e) {
            console.error('导入失败:', e);
            return null;
        }
    },

    /**
     * 自动保存
     * @param {Object} gameEngine - 游戏引擎实例
     */
    autoSave: function(gameEngine) {
        const saveData = gameEngine.getSaveData();
        return this.save(saveData, 0);  // 默认使用第一个槽位
    }
};

/**
 * 本地存储键名（用于其他用途）
 */
const STORAGE_KEYS = {
    SETTINGS: 'lifeRestart_settings',
    STATISTICS: 'lifeRestart_statistics',
    ACHIEVEMENTS: 'lifeRestart_achievements'
};

/**
 * 设置管理器
 */
const SettingsManager = {
    /**
     * 获取设置
     * @returns {Object} 设置对象
     */
    get: function() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
            return data ? JSON.parse(data) : this.getDefaultSettings();
        } catch (e) {
            return this.getDefaultSettings();
        }
    },

    /**
     * 获取默认设置
     * @returns {Object} 默认设置
     */
    getDefaultSettings: function() {
        return {
            soundEnabled: true,
            musicEnabled: true,
            volume: 0.5,
            autoSave: true,
            fastMode: false
        };
    },

    /**
     * 保存设置
     * @param {Object} settings - 设置对象
     */
    save: function(settings) {
        try {
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        } catch (e) {
            console.error('保存设置失败:', e);
        }
    },

    /**
     * 更新单个设置
     * @param {string} key - 设置键
     * @param {*} value - 设置值
     */
    set: function(key, value) {
        const settings = this.get();
        settings[key] = value;
        this.save(settings);
    }
};

/**
 * 统计系统
 */
const Statistics = {
    /**
     * 获取统计信息
     * @returns {Object} 统计对象
     */
    get: function() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.STATISTICS);
            return data ? JSON.parse(data) : this.getDefaultStats();
        } catch (e) {
            return this.getDefaultStats();
        }
    },

    /**
     * 获取默认统计
     * @returns {Object} 默认统计
     */
    getDefaultStats: function() {
        return {
            totalGames: 0,
            totalPlayTime: 0,
            averageAge: 0,
            highestAge: 0,
            lowestAge: 100,
            richestMoney: 0,
            bestRank: null,
            mostPlayedGender: { male: 0, female: 0, other: 0 },
            achievements: [],
            totalAchievements: 0,
            lifeStageStats: {
                childhood: { count: 0, maxAge: 0 },
                teen: { count: 0, maxAge: 0 },
                young: { count: 0, maxAge: 0 },
                middle: { count: 0, maxAge: 0 },
                elder: { count: 0, maxAge: 0 }
            },
            attributeStats: {
                maxIntelligence: 0,
                maxConstitution: 0,
                maxCharisma: 0,
                maxLuck: 0
            },
            deathReasons: {},
            careerStats: {},
            eventStats: {
                totalEvents: 0,
                eventTypes: {}
            },
            talentStats: {
                used: {}
            },
            zodiacStats: {
                used: {}
            },
            winRate: {
                games: 0,
                wins: 0
            },
            streaks: {
                currentWinStreak: 0,
                longestWinStreak: 0,
                currentLoseStreak: 0,
                longestLoseStreak: 0
            }
        };
    },

    /**
     * 更新统计
     * @param {Object} gameData - 游戏数据
     */
    update: function(gameData) {
        const stats = this.get();
        
        stats.totalGames++;
        
        if (gameData.player.age > stats.highestAge) {
            stats.highestAge = gameData.player.age;
        }
        
        if (gameData.player.age < stats.lowestAge) {
            stats.lowestAge = gameData.player.age;
        }
        
        if (gameData.player.totalMoney > stats.richestMoney) {
            stats.richestMoney = gameData.player.totalMoney;
        }
        
        const totalAge = stats.averageAge * (stats.totalGames - 1) + gameData.player.age;
        stats.averageAge = Math.round(totalAge / stats.totalGames);
        
        if (gameData.player.gender && stats.mostPlayedGender[gameData.player.gender] !== undefined) {
            stats.mostPlayedGender[gameData.player.gender]++;
        }
        
        if (gameData.player.lifeStage) {
            const stageId = gameData.player.lifeStage.id;
            if (stats.lifeStageStats[stageId]) {
                stats.lifeStageStats[stageId].count++;
                if (gameData.player.age > stats.lifeStageStats[stageId].maxAge) {
                    stats.lifeStageStats[stageId].maxAge = gameData.player.age;
                }
            }
        }
        
        if (gameData.player.maxAttributes) {
            if (gameData.player.maxAttributes.intelligence > stats.attributeStats.maxIntelligence) {
                stats.attributeStats.maxIntelligence = gameData.player.maxAttributes.intelligence;
            }
            if (gameData.player.maxAttributes.constitution > stats.attributeStats.maxConstitution) {
                stats.attributeStats.maxConstitution = gameData.player.maxAttributes.constitution;
            }
            if (gameData.player.maxAttributes.charisma > stats.attributeStats.maxCharisma) {
                stats.attributeStats.maxCharisma = gameData.player.maxAttributes.charisma;
            }
            if (gameData.player.maxAttributes.luck > stats.attributeStats.maxLuck) {
                stats.attributeStats.maxLuck = gameData.player.maxAttributes.luck;
            }
        }
        
        if (gameData.player.deathReason) {
            if (!stats.deathReasons[gameData.player.deathReason]) {
                stats.deathReasons[gameData.player.deathReason] = 0;
            }
            stats.deathReasons[gameData.player.deathReason]++;
        }
        
        if (gameData.player.eventsCount) {
            stats.eventStats.totalEvents += gameData.player.eventsCount;
        }
        
        if (gameData.player.talents && gameData.player.talents.length > 0) {
            gameData.player.talents.forEach(talent => {
                if (!stats.talentStats.used[talent.id]) {
                    stats.talentStats.used[talent.id] = { name: talent.name, count: 0 };
                }
                stats.talentStats.used[talent.id].count++;
            });
        }
        
        if (gameData.ending) {
            const isWin = gameData.ending.type === 'good' || gameData.player.age >= 80;
            stats.winRate.games++;
            if (isWin) {
                stats.winRate.wins++;
                stats.streaks.currentWinStreak++;
                stats.streaks.currentLoseStreak = 0;
                if (stats.streaks.currentWinStreak > stats.streaks.longestWinStreak) {
                    stats.streaks.longestWinStreak = stats.streaks.currentWinStreak;
                }
            } else {
                stats.streaks.currentLoseStreak++;
                stats.streaks.currentWinStreak = 0;
                if (stats.streaks.currentLoseStreak > stats.streaks.longestLoseStreak) {
                    stats.streaks.longestLoseStreak = stats.streaks.currentLoseStreak;
                }
            }
        }
        
        this.save(stats);
    },

    /**
     * 添加成就
     * @param {Object} achievement - 成就对象
     */
    addAchievement: function(achievement) {
        const stats = this.get();
        
        if (!stats.achievements.some(a => a.id === achievement.id)) {
            stats.achievements.push({
                id: achievement.id,
                name: achievement.name,
                emoji: achievement.emoji,
                unlockedAt: Date.now()
            });
            stats.totalAchievements = stats.achievements.length;
            this.save(stats);
        }
    },

    /**
     * 获取胜率
     * @returns {number} 胜率百分比
     */
    getWinRate: function() {
        const stats = this.get();
        if (stats.winRate.games === 0) return 0;
        return Math.round((stats.winRate.wins / stats.winRate.games) * 100);
    },

    /**
     * 获取最常玩的性别
     * @returns {string} 性别
     */
    getMostPlayedGender: function() {
        const stats = this.get();
        let max = 0;
        let result = 'male';
        
        for (const gender in stats.mostPlayedGender) {
            if (stats.mostPlayedGender[gender] > max) {
                max = stats.mostPlayedGender[gender];
                result = gender;
            }
        }
        
        return result;
    },

    /**
     * 获取最常见的死因
     * @returns {string} 死因
     */
    getMostCommonDeath: function() {
        const stats = this.get();
        let max = 0;
        let result = '未知';
        
        for (const reason in stats.deathReasons) {
            if (stats.deathReasons[reason] > max) {
                max = stats.deathReasons[reason];
                result = reason;
            }
        }
        
        return result;
    },

    /**
     * 保存统计
     * @param {Object} stats - 统计对象
     */
    save: function(stats) {
        try {
            localStorage.setItem(STORAGE_KEYS.STATISTICS, JSON.stringify(stats));
        } catch (e) {
            console.error('保存统计失败:', e);
        }
    },

    /**
     * 重置统计
     */
    reset: function() {
        this.save(this.getDefaultStats());
    },

    /**
     * 获取统计摘要
     * @returns {Object} 摘要对象
     */
    getSummary: function() {
        const stats = this.get();
        return {
            totalGames: stats.totalGames,
            averageAge: stats.averageAge,
            highestAge: stats.highestAge,
            richestMoney: stats.richestMoney,
            winRate: this.getWinRate(),
            totalAchievements: stats.totalAchievements,
            mostPlayedGender: this.getMostPlayedGender(),
            mostCommonDeath: this.getMostCommonDeath(),
            longestWinStreak: stats.streaks.longestWinStreak
        };
    }
};
