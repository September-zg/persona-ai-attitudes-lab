(function () {
const personality=[['E1','我是聚会中的活跃人物','E',false],['E2','我不太爱说话','E',true],['E3','在聚会上我会和许多不同的人交谈','E',false],['E4','我习惯退居幕后','E',true],['A1','我会体谅他人的感受','A',false],['A2','我对别人不太感兴趣','A',true],['A3','我能感受到他人的情绪','A',false],['A4','我对别人的问题不感兴趣','A',true],['C1','我会立刻完成家务','C',false],['C2','我喜欢有条理','C',false],['C3','我常常忘记把东西放回原处','C',true],['C4','我会把事情弄得一团糟','C',true],['N1','我情绪波动频繁','N',false],['N2','我很容易烦恼','N',false],['N3','我大部分时间都很放松','N',true],['N4','我很少情绪低落','N',true],['O1','我有丰富的想象力','O',false],['O2','我很难理解抽象概念','O',true],['O3','我对抽象想法不感兴趣','O',true],['O4','我没有很好的想象力','O',true]];
const attitude=[['U1','AI 工具可以提高我的工作质量','use',false],['U2','我愿意在合适的任务中使用 AI','use',false],['T1','我相信 AI 会清楚说明它的局限','trust',false],['T2','我担心 AI 的建议可能误导我','trust',true],['R1','我担心使用 AI 会带来隐私风险','risk',false],['R2','AI 的风险通常被夸大了','risk',true]];

const dimensions = {
  E: {name:'外向性', section:'personality', explanation:'描述社交活跃、与他人互动和表达精力的倾向。'},
  A: {name:'宜人性', section:'personality', explanation:'描述体谅他人、合作和关心他人感受的倾向。'},
  C: {name:'尽责性', section:'personality', explanation:'描述做事有条理、及时完成任务和保持秩序的倾向。'},
  N: {name:'神经质', section:'personality', explanation:'描述对压力、担忧和负性情绪的敏感程度。高分不表示心理疾病。'},
  O: {name:'开放性', section:'personality', explanation:'描述对想象、抽象概念和新想法的兴趣，不是智商或能力测验。'},
  use: {name:'感知效益与使用意愿', section:'attitude', explanation:'这两题分别询问 AI 的工作帮助和使用意愿；它们不是纯粹的效益量表。'},
  trust: {name:'信任', section:'attitude', explanation:'这两题询问 AI 是否说明局限，以及对误导性建议的担忧（反向）。它们不能代表所有信任情境。'},
  risk: {name:'风险顾虑', section:'attitude', explanation:'描述对隐私风险和风险是否被夸大的看法。高分表示更多顾虑，不等于拒绝使用 AI。'}
};
const feedbackFields = {
  instructions:'参与说明清楚', questions:'题目容易理解', rating:'整体操作容易',
  results:'结果容易理解', satisfaction:'整体体验满意'
};
const definition = {version:'assessment-v1', personality, attitude, dimensions, feedbackFields};
if (typeof module !== 'undefined' && module.exports) module.exports = definition;
else globalThis.AssessmentDefinition = definition;

})();
