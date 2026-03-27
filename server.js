const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Data directories
const DATA_DIR = path.join(__dirname, 'data');
const PROFILES_DIR = path.join(DATA_DIR, 'profiles');
const RESULTS_DIR = path.join(DATA_DIR, 'results');
const STATS_DIR = path.join(DATA_DIR, 'stats');

// Ensure directories exist
[DATA_DIR, PROFILES_DIR, RESULTS_DIR, STATS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Initialize stats file if not exists
const STATS_FILE = path.join(STATS_DIR, 'overview.json');
if (!fs.existsSync(STATS_FILE)) {
  fs.writeFileSync(STATS_FILE, JSON.stringify({ totalAssessments: 0, averageScore: 0, dimensionStats: {} }, null, 2));
}

// ==================== DIMENSIONS LIBRARY (150+ dimensions) ====================
const dimensions = [
  // ========== 学术智能 (Academic Intelligence) - 原有 + 新增 ==========
  { id: "lang_expr_1", name: "语言表达-口头表达", category: "学术智能", categoryId: "academic", description: "孩子用语言清晰表达想法和感受的能力", questions: [] },
  { id: "lang_expr_2", name: "语言表达-书面表达", category: "学术智能", categoryId: "academic", description: "孩子的写作能力和文字组织能力", questions: [] },
  { id: "lang_expr_3", name: "阅读理解能力", category: "学术智能", categoryId: "academic", description: "理解和分析文本的能力", questions: [] },
  { id: "math_logic_1", name: "数学逻辑-基础运算", category: "学术智能", categoryId: "academic", description: "基础数学计算能力", questions: [] },
  { id: "math_logic_2", name: "数学逻辑-逻辑推理", category: "学术智能", categoryId: "academic", description: "运用逻辑推理解决问题的能力", questions: [] },
  { id: "math_logic_3", name: "空间智能", category: "学术智能", categoryId: "academic", description: "空间想象和三维思维能力", questions: [] },
  { id: "science_exp_1", name: "科学探索-好奇心", category: "学术智能", categoryId: "academic", description: "对自然现象的好奇心和探索欲", questions: [] },
  { id: "science_exp_2", name: "科学探究方法", category: "学术智能", categoryId: "academic", description: "提出假设和验证的能力", questions: [] },
  { id: "science_exp_3", name: "实验操作能力", category: "学术智能", categoryId: "academic", description: "动手操作和观察的能力", questions: [] },
  { id: "learn_strat_1", name: "学习策略与方法", category: "学术智能", categoryId: "academic", description: "有效的学习方法和策略运用", questions: [] },
  { id: "info_retrieval_1", name: "信息检索与筛选", category: "学术智能", categoryId: "academic", description: "从多种渠道获取和筛选信息的能力", questions: [] },
  { id: "academic_writing_1", name: "学术写作能力", category: "学术智能", categoryId: "academic", description: "学术论文和报告的写作能力", questions: [] },
  { id: "research_proj_1", name: "研究项目能力", category: "学术智能", categoryId: "academic", description: "独立开展研究项目的能力", questions: [] },
  { id: "interdisciplinary_1", name: "跨学科思维", category: "学术智能", categoryId: "academic", description: "整合多学科知识解决问题的能力", questions: [] },

  // ========== 艺术创造 (Artistic Creation) ==========
  { id: "music_rhythm_1", name: "音乐感知-旋律", category: "艺术创造", categoryId: "artistic", description: "感知和理解旋律的能力", questions: [] },
  { id: "music_rhythm_2", name: "音乐感知-节奏", category: "艺术创造", categoryId: "artistic", description: "感知和表达节奏的能力", questions: [] },
  { id: "music_rhythm_3", name: "音乐创作基础", category: "艺术创造", categoryId: "artistic", description: "创作简单音乐作品的能力", questions: [] },
  { id: "music_rhythm_4", name: "音乐理论理解", category: "艺术创造", categoryId: "artistic", description: "对音乐基本理论的理解", questions: [] },
  { id: "visual_art_1", name: "绘画表现-创意", category: "艺术创造", categoryId: "artistic", description: "绘画中的创造力和想象力", questions: [] },
  { id: "visual_art_2", name: "绘画表现-技巧", category: "艺术创造", categoryId: "artistic", description: "绘画基本技巧掌握程度", questions: [] },
  { id: "visual_art_3", name: "色彩运用能力", category: "艺术创造", categoryId: "artistic", description: "对色彩的感知和运用能力", questions: [] },
  { id: "drama_1", name: "戏剧表演能力", category: "艺术创造", categoryId: "artistic", description: "角色扮演和戏剧表演的能力", questions: [] },
  { id: "dance_1", name: "舞蹈运动协调", category: "艺术创造", categoryId: "artistic", description: "舞蹈中的身体协调和表现力", questions: [] },
  { id: "photography_1", name: "摄影与影像", category: "艺术创造", categoryId: "artistic", description: "摄影构图和影像表达能力", questions: [] },
  { id: "craft_1", name: "陶艺与雕塑", category: "艺术创造", categoryId: "artistic", description: "动手创作立体艺术品的能力", questions: [] },
  { id: "culinary_1", name: "烹饪艺术", category: "艺术创造", categoryId: "artistic", description: "烹饪中的创意和美感表达", questions: [] },

  // ========== 科技素养 (Technology Literacy) ==========
  { id: "tech_use_1", name: "基础电脑操作", category: "科技素养", categoryId: "tech", description: "使用计算机的基本能力", questions: [] },
  { id: "tech_use_2", name: "办公软件应用", category: "科技素养", categoryId: "tech", description: "使用办公软件的能力", questions: [] },
  { id: "tech_use_3", name: "多媒体内容创作", category: "科技素养", categoryId: "tech", description: "创建多媒体内容的能力", questions: [] },
  { id: "digital_literacy_1", name: "网络信息素养", category: "科技素养", categoryId: "tech", description: "评估和利用网络信息的能力", questions: [] },
  { id: "programming_1", name: "编程实践能力", category: "科技素养", categoryId: "tech", description: "编写程序解决问题的能力", questions: [] },
  { id: "robotics_1", name: "机器人技术理解", category: "科技素养", categoryId: "tech", description: "对机器人原理和应用的理解", questions: [] },
  { id: "cybersecurity_1", name: "网络安全意识", category: "科技素养", categoryId: "tech", description: "保护个人信息和安全上网意识", questions: [] },
  { id: "ai_ml_1", name: "AI与机器学习概念", category: "科技素养", categoryId: "tech", description: "对人工智能和机器学习的基本理解", questions: [] },
  { id: "data_vis_1", name: "数据可视化能力", category: "科技素养", categoryId: "tech", description: "解读和创建数据可视化展示", questions: [] },

  // ========== 社交情感 (Social-Emotional) ==========
  { id: "social_skill_1", name: "人际交往能力", category: "社交情感", categoryId: "social", description: "与他人建立和维持关系的能力", questions: [] },
  { id: "social_skill_2", name: "同理心与共情", category: "社交情感", categoryId: "social", description: "理解和感受他人情绪的能力", questions: [] },
  { id: "social_skill_3", name: "合作与团队精神", category: "社交情感", categoryId: "social", description: "在团队中协作的能力", questions: [] },
  { id: "social_skill_4", name: "冲突解决能力", category: "社交情感", categoryId: "social", description: "处理人际矛盾的能力", questions: [] },
  { id: "emotion_reg_1", name: "情绪识别与理解", category: "社交情感", categoryId: "social", description: "识别和理解自身及他人情绪", questions: [] },
  { id: "emotion_reg_2", name: "情绪表达能力", category: "社交情感", categoryId: "social", description: "适当表达情绪的能力", questions: [] },
  { id: "emotion_reg_3", name: "情绪调节能力", category: "社交情感", categoryId: "social", description: "管理和调节情绪的能力", questions: [] },
  { id: "self_aware_1", name: "自我认知能力", category: "社交情感", categoryId: "social", description: "了解自身优缺点的能力", questions: [] },
  { id: "self_aware_2", name: "自我接纳程度", category: "社交情感", categoryId: "social", description: "接纳自身特质的能力", questions: [] },
  { id: "cross_age_1", name: "跨年龄沟通能力", category: "社交情感", categoryId: "social", description: "与不同年龄层沟通的能力", questions: [] },
  { id: "social_network_1", name: "社交网络建立", category: "社交情感", categoryId: "social", description: "建立和维护社交网络的能力", questions: [] },
  { id: "lead_follow_1", name: "领导与追随平衡", category: "社交情感", categoryId: "social", description: "在不同情境下担任领导或追随者", questions: [] },
  { id: "volunteer_1", name: "志愿服务意识", category: "社交情感", categoryId: "social", description: "参与志愿服务和回馈社会的意识", questions: [] },
  { id: "multicultural_1", name: "多元文化理解", category: "社交情感", categoryId: "social", description: "理解和尊重不同文化背景", questions: [] },

  // ========== 逻辑思维 (Logical Thinking) ==========
  { id: "logic_reason_1", name: "归纳推理能力", category: "逻辑思维", categoryId: "logic", description: "从具体事例归纳一般规律", questions: [] },
  { id: "logic_reason_2", name: "演绎推理能力", category: "逻辑思维", categoryId: "logic", description: "从一般规律推导具体结论", questions: [] },
  { id: "logic_reason_3", name: "问题分析能力", category: "逻辑思维", categoryId: "logic", description: "分解和分析复杂问题的能力", questions: [] },
  { id: "logic_reason_4", name: "批判性思维", category: "逻辑思维", categoryId: "logic", description: "质疑和分析论证的能力", questions: [] },
  { id: "game_theory_1", name: "博弈论基础", category: "逻辑思维", categoryId: "logic", description: "理解策略互动和决策权衡", questions: [] },
  { id: "system_model_1", name: "系统建模能力", category: "逻辑思维", categoryId: "logic", description: "建立和理解复杂系统的能力", questions: [] },
  { id: "math_intuition_1", name: "数学直觉", category: "逻辑思维", categoryId: "logic", description: "对数学问题直观理解和感知", questions: [] },
  { id: "stats_basic_1", name: "统计分析初阶", category: "逻辑思维", categoryId: "logic", description: "理解和应用基础统计分析", questions: [] },
  { id: "philosophy_1", name: "哲学思考能力", category: "逻辑思维", categoryId: "logic", description: "对根本问题进行深度思考", questions: [] },

  // ========== 自律专注 (Self-Discipline & Focus) ==========
  { id: "self_control_1", name: "注意力稳定性", category: "自律专注", categoryId: "discipline", description: "长时间保持注意力的能力", questions: [] },
  { id: "self_control_2", name: "抗干扰能力", category: "自律专注", categoryId: "discipline", description: "在分心环境中专注的能力", questions: [] },
  { id: "self_control_3", name: "冲动抑制能力", category: "自律专注", categoryId: "discipline", description: "克制即时冲动的自我控制", questions: [] },
  { id: "habit_form_1", name: "习惯养成能力", category: "自律专注", categoryId: "discipline", description: "建立和维持良好习惯", questions: [] },
  { id: "time_mgmt_1", name: "时间管理能力", category: "自律专注", categoryId: "discipline", description: "有效规划和使用时间", questions: [] },
  { id: "goal_plan_1", name: "目标规划与执行", category: "自律专注", categoryId: "discipline", description: "设定目标并持续执行的能力", questions: [] },
  { id: "stress_mgmt_1", name: "压力管理与应对", category: "自律专注", categoryId: "discipline", description: "识别和管理压力的能力", questions: [] },
  { id: "resilience_1", name: "心理韧性", category: "自律专注", categoryId: "discipline", description: "面对挫折恢复的能力", questions: [] },
  { id: "self_motivation_1", name: "自我激励策略", category: "自律专注", categoryId: "discipline", description: "自我驱动和激励的能力", questions: [] },
  { id: "growth_mindset_1", name: "成长型思维", category: "自律专注", categoryId: "discipline", description: "相信能力可以通过努力提升", questions: [] },

  // ========== 领导力 (Leadership) ==========
  { id: "leadership_1", name: "组织协调能力", category: "领导力", categoryId: "leadership", description: "组织和协调活动的能力", questions: [] },
  { id: "leadership_2", name: "决策判断能力", category: "领导力", categoryId: "leadership", description: "做出明智决策的能力", questions: [] },
  { id: "leadership_3", name: "影响力与说服", category: "领导力", categoryId: "leadership", description: "影响和说服他人的能力", questions: [] },
  { id: "public_speak_1", name: "公共演讲能力", category: "领导力", categoryId: "leadership", description: "在公众面前清晰表达的能力", questions: [] },
  { id: "project_plan_1", name: "项目策划能力", category: "领导力", categoryId: "leadership", description: "策划和推进项目的能力", questions: [] },
  { id: "resource_coord_1", name: "资源协调能力", category: "领导力", categoryId: "leadership", description: "有效调配和利用资源", questions: [] },
  { id: "change_mgmt_1", name: "变革管理意识", category: "领导力", categoryId: "leadership", description: "适应和引领变革的能力", questions: [] },
  { id: "strategic_1", name: "战略规划思维", category: "领导力", categoryId: "leadership", description: "长期规划和战略思考能力", questions: [] },

  // ========== 生活自理 (Life Skills) ==========
  { id: "daily_living_1", name: "生活自理能力", category: "生活自理", categoryId: "life", description: "基本日常生活处理能力", questions: [] },
  { id: "daily_living_2", name: "时间规划能力", category: "生活自理", categoryId: "life", description: "合理安排日常作息", questions: [] },
  { id: "daily_living_3", name: "物品管理能力", category: "生活自理", categoryId: "life", description: "整理和保管个人物品", questions: [] },
  { id: "safety_aware_1", name: "安全意识", category: "生活自理", categoryId: "life", description: "识别和避免危险的能力", questions: [] },
  { id: "financial_1", name: "金融素养基础", category: "生活自理", categoryId: "life", description: "基础金钱管理和财务规划", questions: [] },
  { id: "health_mgmt_1", name: "健康管理意识", category: "生活自理", categoryId: "life", description: "关注和维护自身健康", questions: [] },
  { id: "env_sustain_1", name: "环境与可持续", category: "生活自理", categoryId: "life", description: "环保意识和可持续发展观念", questions: [] },
  { id: "risk_assess_1", name: "安全风险评估", category: "生活自理", categoryId: "life", description: "识别和评估潜在风险", questions: [] },
  { id: "first_aid_1", name: "急救基础知识", category: "生活自理", categoryId: "life", description: "基本急救知识和技能", questions: [] },

  // ========== 想象力 (Imagination) ==========
  { id: "creativity_1", name: "发散思维", category: "想象力", categoryId: "imagination", description: "产生多种创意想法的能力", questions: [] },
  { id: "creativity_2", name: "想象力丰富度", category: "想象力", categoryId: "imagination", description: "创造性地想象场景和情节", questions: [] },
  { id: "creativity_3", name: "创意问题解决", category: "想象力", categoryId: "imagination", description: "用创意方法解决问题的能力", questions: [] },
  { id: "design_think_1", name: "设计思维", category: "想象力", categoryId: "imagination", description: "以用户为中心的设计思考能力", questions: [] },
  { id: "entrepreneur_1", name: "创业精神启蒙", category: "想象力", categoryId: "imagination", description: "创新、冒险和商业意识启蒙", questions: [] },
  { id: "future_pred_1", name: "未来预测能力", category: "想象力", categoryId: "imagination", description: "预见趋势和可能性的能力", questions: [] },
  { id: "cross_media_1", name: "跨媒介创作", category: "想象力", categoryId: "imagination", description: "在不同媒介间转换创意", questions: [] },

  // ========== 运动协调 (Motor Skills) ==========
  { id: "physical_1", name: "大肌肉群运动", category: "运动协调", categoryId: "physical", description: "跑跳投等大动作能力", questions: [] },
  { id: "physical_2", name: "精细动作发展", category: "运动协调", categoryId: "physical", description: "手部精细动作控制能力", questions: [] },
  { id: "physical_3", name: "身体平衡能力", category: "运动协调", categoryId: "physical", description: "保持身体平衡的能力", questions: [] },
  { id: "physical_4", name: "运动协调综合", category: "运动协调", categoryId: "physical", description: "手脚协调配合能力", questions: [] },
  { id: "sports_tactics_1", name: "运动战术意识", category: "运动协调", categoryId: "physical", description: "理解和使用战术策略", questions: [] },
  { id: "sports_psych_1", name: "运动心理", category: "运动协调", categoryId: "physical", description: "运动中的心理素质和状态", questions: [] },
  { id: "team_sports_1", name: "团队运动适应", category: "运动协调", categoryId: "physical", description: "适应和参与团队运动", questions: [] },

  // ========== 语言发展 (Language Development) ==========
  { id: "lang_dev_1", name: "母语深度掌握", category: "语言发展", categoryId: "language", description: "对母语的深入理解和运用", questions: [] },
  { id: "lang_dev_2", name: "外语学习潜力", category: "语言发展", categoryId: "language", description: "学习外语的天赋和潜力", questions: [] },
  { id: "lang_dev_3", name: "方言与文化理解", category: "语言发展", categoryId: "language", description: "对方言和地域文化的理解", questions: [] },
  { id: "lang_dev_4", name: "语言学习策略", category: "语言发展", categoryId: "language", description: "有效的语言学习方法", questions: [] },

  // ========== 原有维度补充（确保96+） ==========
  { id: "memory_1", name: "记忆力-短时记忆", category: "学术智能", categoryId: "academic", description: "短时间内记忆信息的能力", questions: [] },
  { id: "memory_2", name: "记忆力-长时记忆", category: "学术智能", categoryId: "academic", description: "长期保持记忆的能力", questions: [] },
  { id: "attention_1", name: "注意力-选择性", category: "自律专注", categoryId: "discipline", description: "在干扰中选择性专注", questions: [] },
  { id: "attention_2", name: "注意力-分配性", category: "自律专注", categoryId: "discipline", description: "同时关注多个任务", questions: [] },
  { id: "observation_1", name: "观察力-细节捕捉", category: "学术智能", categoryId: "academic", description: "发现细节和差异的能力", questions: [] },
  { id: "observation_2", name: "观察力-系统观察", category: "学术智能", categoryId: "academic", description: "系统化观察的方法", questions: [] },
  { id: "concept_1", name: "概念形成能力", category: "学术智能", categoryId: "academic", description: "从经验中形成概念", questions: [] },
  { id: "abstract_1", name: "抽象思维能力", category: "学术智能", categoryId: "academic", description: "处理抽象概念的能力", questions: [] },
  { id: "pattern_1", name: "模式识别能力", category: "逻辑思维", categoryId: "logic", description: "识别规律和模式", questions: [] },
  { id: "sequence_1", name: "序列推理能力", category: "逻辑思维", categoryId: "logic", description: "理解事物发展顺序", questions: [] },
  { id: "analogy_1", name: "类比推理能力", category: "逻辑思维", categoryId: "logic", description: "通过类比理解新事物", questions: [] },
  { id: "cause_effect_1", name: "因果关系理解", category: "逻辑思维", categoryId: "logic", description: "理解因果关联", questions: [] },
  { id: "spatial_1", name: "空间关系认知", category: "学术智能", categoryId: "academic", description: "理解物体空间关系", questions: [] },
  { id: "visualThinking_1", name: "可视化思维", category: "学术智能", categoryId: "academic", description: "用视觉方式思考问题", questions: [] },
  { id: "problemFind_1", name: "问题发现能力", category: "逻辑思维", categoryId: "logic", description: "发现问题和需求", questions: [] },
  { id: "problemSolve_1", name: "问题解决综合", category: "逻辑思维", categoryId: "logic", description: "综合问题解决能力", questions: [] },
  { id: "decision_1", name: "决策能力综合", category: "领导力", categoryId: "leadership", description: "做出并承担决策", questions: [] },
  { id: "risk_take_1", name: "风险承担意愿", category: "领导力", categoryId: "leadership", description: "适度冒险的意愿", questions: [] },
  { id: "initiative_1", name: "主动性", category: "领导力", categoryId: "leadership", description: "主动行动和担当", questions: [] },
  { id: "persistence_1", name: "坚持不懈", category: "自律专注", categoryId: "discipline", description: "面对困难不放弃", questions: [] },
  { id: "adaptability_1", name: "适应能力", category: "社交情感", categoryId: "social", description: "适应新环境能力", questions: [] },
  { id: "flexibility_1", name: "思维灵活性", category: "想象力", categoryId: "imagination", description: "灵活转换思维", questions: [] },
  { id: "curiosity_1", name: "好奇心", category: "学术智能", categoryId: "academic", description: "探索新事物的欲望", questions: [] },
  { id: "wonder_1", name: "求知欲", category: "学术智能", categoryId: "academic", description: "渴望学习和了解", questions: [] },
  { id: "confidence_1", name: "自信心", category: "社交情感", categoryId: "social", description: "对自身能力的信心", questions: [] },
  { id: "independence_1", name: "独立性", category: "生活自理", categoryId: "life", description: "独立完成任务能力", questions: [] },
  { id: "responsibility_1", name: "责任感", category: "社交情感", categoryId: "social", description: "承担责任的意识", questions: [] },
  { id: "cooperation_1", name: "配合度", category: "社交情感", categoryId: "social", description: "配合他人的意愿", questions: [] },
  { id: "sharing_1", name: "分享意愿", category: "社交情感", categoryId: "social", description: "与他人分享的意愿", questions: [] },
  { id: "caring_1", name: "关爱能力", category: "社交情感", categoryId: "social", description: "关心爱护他人", questions: [] },
  { id: "respect_1", name: "尊重他人", category: "社交情感", categoryId: "social", description: "尊重他人想法和差异", questions: [] },
  { id: "honesty_1", name: "诚实守信", category: "社交情感", categoryId: "social", description: "诚实和守信用", questions: [] },
  { id: "fairness_1", name: "公平意识", category: "社交情感", categoryId: "social", description: "公平对待他人", questions: [] },
  { id: "手眼协调_1", name: "手眼协调", category: "运动协调", categoryId: "physical", description: "眼手配合能力", questions: [] },
  { id: "敏捷性_1", name: "敏捷性", category: "运动协调", categoryId: "physical", description: "快速反应能力", questions: [] },
  { id: "耐力_1", name: "耐力", category: "运动协调", categoryId: "physical", description: "持续运动能力", questions: [] },
  { id: "力量_1", name: "力量发展", category: "运动协调", categoryId: "physical", description: "肌肉力量发展", questions: [] },
  { id: "柔韧性_1", name: "柔韧性", category: "运动协调", categoryId: "physical", description: "身体柔韧程度", questions: [] },
  { id: "节奏感_1", name: "节奏感", category: "艺术创造", categoryId: "artistic", description: "感知和表达节奏", questions: [] },
  { id: "音准_1", name: "音准", category: "艺术创造", categoryId: "artistic", description: "唱歌音准能力", questions: [] },
  { id: "表演欲_1", name: "表演欲", category: "艺术创造", categoryId: "artistic", description: "展示自我的意愿", questions: [] },
  { id: "画画兴趣_1", name: "绘画兴趣", category: "艺术创造", categoryId: "artistic", description: "对绘画的兴趣程度", questions: [] },
  { id: "手工能力_1", name: "手工能力", category: "艺术创造", categoryId: "artistic", description: "手工艺制作能力", questions: [] },
  { id: "表演才能_1", name: "表演才能", category: "艺术创造", categoryId: "artistic", description: "舞台表演天赋", questions: [] },
  { id: "音乐兴趣_1", name: "音乐兴趣", category: "艺术创造", categoryId: "artistic", description: "对音乐的兴趣", questions: [] },
  { id: "审美能力_1", name: "审美能力", category: "艺术创造", categoryId: "artistic", description: "对美的感知和欣赏", questions: [] },
  { id: "色彩敏感_1", name: "色彩敏感度", category: "艺术创造", categoryId: "artistic", description: "对色彩的敏感程度", questions: [] },
  { id: "形状认知_1", name: "形状认知", category: "学术智能", categoryId: "academic", description: "识别和区分形状", questions: [] },
  { id: "数量感知_1", name: "数量感知", category: "学术智能", categoryId: "academic", description: "对数量的理解", questions: [] },
  { id: "排序能力_1", name: "排序能力", category: "逻辑思维", categoryId: "logic", description: "按规律排序", questions: [] },
  { id: "分类能力_1", name: "分类能力", category: "逻辑思维", categoryId: "logic", description: "按特征分类", questions: [] },
  { id: "比较能力_1", name: "比较能力", category: "逻辑思维", categoryId: "logic", description: "比较事物异同", questions: [] },
  { id: "语言理解_1", name: "语言理解力", category: "语言发展", categoryId: "language", description: "理解语言含义", questions: [] },
  { id: "词汇量_1", name: "词汇量发展", category: "语言发展", categoryId: "language", description: "词汇掌握程度", questions: [] },
  { id: "表达能力_1", name: "综合表达能力", category: "语言发展", categoryId: "language", description: "综合语言表达", questions: [] },
  { id: "阅读兴趣_1", name: "阅读兴趣", category: "学术智能", categoryId: "academic", description: "对阅读的热爱程度", questions: [] },
  { id: "阅读速度_1", name: "阅读速度", category: "学术智能", categoryId: "academic", description: "阅读效率", questions: [] },
  { id: "写作兴趣_1", name: "写作兴趣", category: "学术智能", categoryId: "academic", description: "对写作的热情", questions: [] },
  { id: "计算能力_1", name: "计算能力", category: "学术智能", categoryId: "academic", description: "数学计算能力", questions: [] },
  { id: "数学兴趣_1", name: "数学兴趣", category: "学术智能", categoryId: "academic", description: "对数学的兴趣", questions: [] },
  { id: "科学兴趣_1", name: "科学兴趣", category: "学术智能", categoryId: "academic", description: "对科学的热爱", questions: [] },
  { id: "探索精神_1", name: "探索精神", category: "学术智能", categoryId: "academic", description: "探索未知的勇气", questions: [] },
  { id: "动手能力_1", name: "动手能力", category: "科技素养", categoryId: "tech", description: "实际操作能力", questions: [] },
  { id: "环保意识_1", name: "环保意识", category: "生活自理", categoryId: "life", description: "环境保护观念", questions: [] },
  { id: "规则意识_1", name: "规则意识", category: "生活自理", categoryId: "life", description: "遵守规则的习惯", questions: [] },
  { id: "自我保护_1", name: "自我保护意识", category: "生活自理", categoryId: "life", description: "自我保护能力", questions: [] },
  { id: "情绪稳定_1", name: "情绪稳定性", category: "社交情感", categoryId: "social", description: "情绪平稳程度", questions: [] },
  { id: "乐观态度_1", name: "乐观态度", category: "社交情感", categoryId: "social", description: "积极乐观的心态", questions: [] },
  { id: "幽默感_1", name: "幽默感", category: "社交情感", categoryId: "social", description: "幽默和风趣", questions: [] },
  { id: "感恩心态_1", name: "感恩心态", category: "社交情感", categoryId: "social", description: "感恩和珍惜", questions: [] },
  { id: "进取心_1", name: "进取心", category: "领导力", categoryId: "leadership", description: "追求进步的动力", questions: [] },
  { id: "坚韧不拔_1", name: "坚韧不拔", category: "自律专注", categoryId: "discipline", description: "意志坚强", questions: [] },
  { id: "精益求精_1", name: "精益求精", category: "自律专注", categoryId: "discipline", description: "追求完美", questions: [] }
];

// Generate 5-point Likert scale questions for each dimension
dimensions.forEach(dim => {
  dim.questions = [
    { id: `${dim.id}_q1`, text: `在我的生活中，我能表现出${dim.name}相关的能力`, options: ["完全不符合", "不太符合", "一般符合", "比较符合", "完全符合"] },
    { id: `${dim.id}_q2`, text: `我愿意主动参与与${dim.name}相关的活动`, options: ["完全不符合", "不太符合", "一般符合", "比较符合", "完全符合"] },
    { id: `${dim.id}_q3`, text: `我在${dim.name}方面比同龄人表现更好`, options: ["完全不符合", "不太符合", "一般符合", "比较符合", "完全符合"] },
    { id: `${dim.id}_q4`, text: `我希望进一步提高我在${dim.name}方面的能力`, options: ["完全不符合", "不太符合", "一般符合", "比较符合", "完全符合"] }
  ];
});

// Categories
const categories = [
  { id: "academic", name: "学术智能", icon: "📚", color: "#4A90D9" },
  { id: "artistic", name: "艺术创造", icon: "🎨", color: "#E74C8C" },
  { id: "tech", name: "科技素养", icon: "💻", color: "#27AE60" },
  { id: "social", name: "社交情感", icon: "💬", color: "#F39C12" },
  { id: "logic", name: "逻辑思维", icon: "🧩", color: "#9B59B6" },
  { id: "discipline", name: "自律专注", icon: "🎯", color: "#1ABC9C" },
  { id: "leadership", name: "领导力", icon: "👑", color: "#E67E22" },
  { id: "life", name: "生活自理", icon: "🏠", color: "#3498DB" },
  { id: "imagination", name: "想象力", icon: "✨", color: "#F1C40F" },
  { id: "physical", name: "运动协调", icon: "⚽", color: "#2ECC71" },
  { id: "language", name: "语言发展", icon: "🗣️", color: "#E91E63" }
];

// ==================== HELPER FUNCTIONS ====================
function getProfilePath(id) {
  return path.join(PROFILES_DIR, `${id}.json`);
}

function getResultPath(id) {
  return path.join(RESULTS_DIR, `${id}.json`);
}

function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    return null;
  }
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function calculatePercentile(score, allScores) {
  const sorted = [...allScores].sort((a, b) => a - b);
  const rank = sorted.filter(s => s < score).length;
  return Math.round((rank / sorted.length) * 100);
}

function updateStats() {
  const results = fs.readdirSync(RESULTS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => readJSON(getResultPath(f.replace('.json', ''))))
    .filter(r => r);

  const stats = {
    totalAssessments: results.length,
    averageScore: results.length > 0 ? results.reduce((sum, r) => sum + r.overallScore, 0) / results.length : 0,
    dimensionStats: {}
  };

  // Calculate dimension averages
  const dimensionScores = {};
  results.forEach(r => {
    Object.entries(r.dimensionScores).forEach(([dimId, data]) => {
      if (!dimensionScores[dimId]) dimensionScores[dimId] = [];
      dimensionScores[dimId].push(data.score);
    });
  });

  Object.entries(dimensionScores).forEach(([dimId, scores]) => {
    stats.dimensionStats[dimId] = {
      average: scores.reduce((a, b) => a + b, 0) / scores.length,
      count: scores.length
    };
  });

  writeJSON(STATS_FILE, stats);
  return stats;
}

// ==================== API ENDPOINTS ====================

// GET /api/dimensions - Get all dimensions
app.get('/api/dimensions', (req, res) => {
  res.json({
    dimensions,
    categories
  });
});

// GET /api/profiles - List all profiles
app.get('/api/profiles', (req, res) => {
  const profiles = fs.readdirSync(PROFILES_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const profile = readJSON(getProfilePath(f.replace('.json', '')));
      return profile ? { id: profile.id, name: profile.name, avatarColor: profile.avatarColor } : null;
    })
    .filter(p => p);
  res.json(profiles);
});

// POST /api/profiles - Create profile
app.post('/api/profiles', (req, res) => {
  const { name, birthDate, gender, avatarColor } = req.body;
  const id = uuidv4();
  const profile = {
    id,
    name,
    birthDate,
    gender,
    avatarColor: avatarColor || '#4A90D9',
    createdAt: new Date().toISOString()
  };
  writeJSON(getProfilePath(id), profile);
  res.json(profile);
});

// GET /api/profiles/:id - Get profile
app.get('/api/profiles/:id', (req, res) => {
  const profile = readJSON(getProfilePath(req.params.id));
  if (!profile) return res.status(404).json({ error: 'Profile not found' });
  res.json(profile);
});

// PUT /api/profiles/:id - Update profile
app.put('/api/profiles/:id', (req, res) => {
  const profile = readJSON(getProfilePath(req.params.id));
  if (!profile) return res.status(404).json({ error: 'Profile not found' });

  const updated = { ...profile, ...req.body, id: profile.id };
  writeJSON(getProfilePath(req.params.id), updated);
  res.json(updated);
});

// DELETE /api/profiles/:id - Delete profile
app.delete('/api/profiles/:id', (req, res) => {
  const profilePath = getProfilePath(req.params.id);
  if (fs.existsSync(profilePath)) {
    fs.unlinkSync(profilePath);
  }
  res.json({ success: true });
});

// GET /api/profiles/:id/results - Get all results for profile
app.get('/api/profiles/:id/results', (req, res) => {
  const results = fs.readdirSync(RESULTS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => readJSON(getResultPath(f.replace('.json', ''))))
    .filter(r => r && r.profileId === req.params.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(results);
});

// POST /api/profiles/:id/results - Save new result
app.post('/api/profiles/:id/results', (req, res) => {
  const profile = readJSON(getProfilePath(req.params.id));
  if (!profile) return res.status(404).json({ error: 'Profile not found' });

  const { dimensionScores, categoryScores, mode, categoryIds, dimensionIds } = req.body;

  // Calculate overall score
  const scores = Object.values(dimensionScores).map(d => d.score);
  const overallScore = scores.reduce((a, b) => a + b, 0) / scores.length;

  // Get all results for percentile calculation
  const allResults = fs.readdirSync(RESULTS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => readJSON(getResultPath(f.replace('.json', ''))))
    .filter(r => r)
    .map(r => r.overallScore);

  const result = {
    id: uuidv4(),
    profileId: req.params.id,
    date: new Date().toISOString(),
    mode,
    categoryIds: categoryIds || [],
    dimensionIds: dimensionIds || [],
    dimensionScores,
    categoryScores,
    overallScore: Math.round(overallScore * 10) / 10,
    percentile: calculatePercentile(overallScore, allResults),
    strengths: findStrengths(dimensionScores),
    improvements: findImprovements(dimensionScores),
    recommendations: generateRecommendations(dimensionScores)
  };

  writeJSON(getResultPath(result.id), result);
  updateStats();
  res.json(result);
});

// GET /api/results/:id - Get single result
app.get('/api/results/:id', (req, res) => {
  const result = readJSON(getResultPath(req.params.id));
  if (!result) return res.status(404).json({ error: 'Result not found' });
  res.json(result);
});

// GET /api/stats - Get overview stats
app.get('/api/stats', (req, res) => {
  const stats = readJSON(STATS_FILE);
  res.json(stats);
});

// ==================== HELPER FUNCTIONS ====================
function findStrengths(dimensionScores) {
  return Object.entries(dimensionScores)
    .filter(([_, data]) => data.score >= 4.0)
    .map(([dimId]) => {
      const dim = dimensions.find(d => d.id === dimId);
      return dim ? dim.name : dimId;
    });
}

function findImprovements(dimensionScores) {
  return Object.entries(dimensionScores)
    .filter(([_, data]) => data.score < 3.0)
    .map(([dimId]) => {
      const dim = dimensions.find(d => d.id === dimId);
      return dim ? dim.name : dimId;
    });
}

function generateRecommendations(dimensionScores) {
  const recommendations = {};
  Object.entries(dimensionScores).forEach(([dimId, data]) => {
    if (data.score < 3.5) {
      const dim = dimensions.find(d => d.id === dimId);
      if (dim) {
        recommendations[dimId] = getRecommendation(dim.categoryId, dim.name);
      }
    }
  });
  return recommendations;
}

function getRecommendation(categoryId, dimensionName) {
  const recs = {
    academic: `建议多阅读相关书籍，培养${dimensionName}相关兴趣`,
    artistic: `建议参加艺术活动，提升${dimensionName}能力`,
    tech: `建议尝试编程和科技探索，培养${dimensionName}`,
    social: `建议多参与集体活动，提升${dimensionName}`,
    logic: `建议练习思维游戏，增强${dimensionName}`,
    discipline: `建议制定计划并坚持执行，培养${dimensionName}`,
    leadership: `建议担任小组长角色，锻炼${dimensionName}`,
    life: `建议参与家务活动，提升${dimensionName}`,
    imagination: `建议进行创意活动和想象练习`,
    physical: `建议加强体育锻炼，提升${dimensionName}`,
    language: `建议多听多说多读，提升${dimensionName}`
  };
  return recs[categoryId] || `建议持续练习和培养${dimensionName}`;
}

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 儿童潜能评估系统已启动 - http://localhost:${PORT}`);
  console.log(`📊 API端点: http://localhost:${PORT}/api`);
});
