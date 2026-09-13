'use strict';
const {personality, attitude, dimensions, feedbackFields} = AssessmentDefinition;
const {score, summarize} = AssessmentAnalysis;
const allItems = [...personality, ...attitude];
const keys = Object.keys(dimensions);
const offline = location.protocol === 'file:';
const params = new URLSearchParams(location.search);
let page = params.get('view') === 'admin' || location.pathname === '/admin' ? 'admin' : 'intro';
let answers = {}, startedAt = null, participantId = null, submission = null, savedResult = null;
let feedbackSubmission = null, busy = false, dashboard = null;
const app = document.querySelector('#app');
const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const fmt = value => value == null ? '—' : value.toFixed(2);
const newId = () => crypto.randomUUID();
const readLocal = key => { try {return JSON.parse(localStorage.getItem(key) || '[]');} catch {return [];} };
function storeLocal(key, item) {
  const rows = readLocal(key);
  if (!rows.some(row => row.id === item.id)) rows.push(item);
  localStorage.setItem(key, JSON.stringify(rows));
}
function token() {return sessionStorage.getItem('adminToken') || '';}
function shell(content) {app.innerHTML = `<div class="shell"><div class="card">${content}</div></div>`;}
function status(message) {document.querySelector('#status').textContent = message;}
function showPage() {render(); window.scrollTo({top:0, behavior:'instant'}); document.querySelector('h1')?.focus();}
function heading(text, eyebrow) {return `<div class="eyebrow">${eyebrow}</div><h1 tabindex="-1">${text}</h1>`;}
async function request(path, {body, admin = false} = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (admin) headers['X-Admin-Token'] = token();
  const response = await fetch('/api' + path, {method:body ? 'POST' : 'GET', headers, body:body ? JSON.stringify(body) : undefined, cache:'no-store'});
  const payload = await response.json();
  if (!response.ok) {
    const error = new Error(payload.error || `请求失败（${response.status}）`);
    error.status = response.status;
    throw error;
  }
  return payload;
}
function render() {
  if (page === 'admin') return adminLogin();
  if (page === 'intro') {
    shell(`${heading('Personality & AI Attitudes Lab', '测评实验室 · 教育研究探索')}
      <p>这是一个教育/研究探索性质的在线测评，用于同时了解人格特征与对人工智能的看法。人格部分采用五大人格框架，AI 态度部分关注感知效益、信任与采纳以及风险顾虑。共 26 题，预计用时 3–5 分钟。</p><p>完成测评后，你会看到各维度的描述性分数和图表。研究者会使用去标识化的汇总结果，观察这两类回答在本批参与者中是否呈现值得进一步研究的关系。</p>
      <p class="muted intro-privacy">我们只保存匿名答题、各维度分数、提交时间、完成用时和可选体验反馈，不收集姓名或联系方式。参与完全自愿，你可以在提交前随时退出，不会影响任何权益。请勿在反馈中写入个人身份信息。</p>
      <p class="muted intro-disclaimer">本测评不是临床、医学诊断或招聘筛选工具；数据仅用于本课程的研究探索与改进体验。结果描述本次回答的倾向，不能给出职业推荐，也不能预测你会如何使用 AI。</p>
      ${offline ? '<p class="warning">当前为离线预览，记录仅保存到这台设备的浏览器，研究者无法在其他设备收到。</p>' : ''}
      <label class="consent"><input id="consent" type="checkbox"> 我已阅读说明并同意参与</label>
      <p id="status" class="status" role="status"></p><div class="actions"><button id="start">开始测评</button></div>`);
    document.querySelector('#start').onclick = () => {
      if (!document.querySelector('#consent').checked) return status('请先阅读说明并勾选同意参与。');
      startedAt = Date.now(); participantId = newId(); page = 'personality'; showPage();
    };
    return;
  }
  if (page === 'thanks') {
    shell(`${heading('谢谢你的参与！', '本次测评已完成')}<p>${offline ? '记录已保存在当前浏览器。' : '你的测评记录已保存。'}${feedbackSubmission?.saved ? '感谢你的体验反馈。' : ''}</p><p class="muted">本测评用于教育/研究探索，不构成诊断。</p><div class="actions"><button id="home">返回首页</button><button class="secondary" id="backResult">再看本次结果</button></div>`);
    document.querySelector('#home').onclick = () => location.href = 'index.html';
    document.querySelector('#backResult').onclick = () => {page = 'results'; showPage();};
    return;
  }
  if (page === 'results') return renderResults();
  const isPersonality = page === 'personality';
  const items = isPersonality ? personality : attitude;
  const labels = isPersonality ? ['非常不符合我','不太符合我','中立／不确定','比较符合我','非常符合我'] : ['强烈不同意','不同意','中立','同意','强烈同意'];
  shell(`<div class="stepper"><span class="${isPersonality ? 'active' : ''}">1 人格</span><i></i><span class="${!isPersonality ? 'active' : ''}">2 AI 态度</span></div>
    ${heading(isPersonality ? '人格测评' : 'AI 态度测评', isPersonality ? '第一部分 · 20 题' : '第二部分 · 6 题')}
    <p>${isPersonality ? '请评价陈述与你通常状态的符合程度，不要按理想中的自己作答。' : '请根据你对 AI 的实际看法选择同意程度。'}没有标准答案。</p>
    <p id="progressText" class="muted"></p><div class="progress" role="progressbar" aria-label="答题进度" aria-valuemin="0" aria-valuemax="26"><i id="progressFill"></i></div>
    ${items.map((q, i) => `<fieldset class="item" id="item-${q[0]}"><legend>${i + 1}. ${q[1]}</legend><div class="scale">${labels.map((label, n) => `<label><input type="radio" name="${q[0]}" value="${n+1}" ${answers[q[0]] === n+1 ? 'checked' : ''}><span>${n+1}</span><span>${label}</span></label>`).join('')}</div></fieldset>`).join('')}
    <p id="status" class="status" role="status"></p><div class="actions">${isPersonality ? '' : '<button class="secondary" id="previous">返回人格部分</button>'}<button id="next">${isPersonality ? '下一部分' : '提交并查看结果'}</button></div>`);
  app.querySelectorAll('input[type=radio]').forEach(input => input.onchange = () => {answers[input.name] = Number(input.value); input.closest('fieldset').classList.remove('missing'); updateProgress();});
  document.querySelector('#previous')?.addEventListener('click', () => {page = 'personality'; showPage();});
  document.querySelector('#next').onclick = next;
  updateProgress();
}
function updateProgress() {
  const count = Object.keys(answers).length;
  document.querySelector('#progressText').textContent = `已回答 ${count} / 26 题`;
  document.querySelector('#progressFill').style.width = `${count / 26 * 100}%`;
  document.querySelector('[role=progressbar]').setAttribute('aria-valuenow', count);
}
async function next() {
  if (busy) return;
  const items = page === 'personality' ? personality : attitude;
  const missing = items.filter(q => !answers[q[0]]);
  if (missing.length) {
    status(`还有 ${missing.length} 题未回答，已定位到第一道。`);
    const field = document.querySelector(`#item-${missing[0][0]}`);
    field.classList.add('missing'); field.scrollIntoView({block:'center'}); field.querySelector('input').focus();
    return;
  }
  if (page === 'personality') {page = 'attitude'; showPage(); return;}
  if (!submission || JSON.stringify(submission.answers) !== JSON.stringify(answers)) {
    submission = {id:newId(), participantId, questionnaireVersion:'assessment-v1', answers:{...answers}, durationSeconds:Math.min(604800, (Date.now()-startedAt)/1000)};
  }
  busy = true;
  document.querySelectorAll('.actions button').forEach(b => b.disabled = true);
  status('正在保存…');
  try {
    if (offline) {
      savedResult = {...submission, scores:score(answers), submittedAt:new Date().toISOString()};
      storeLocal('assessmentResponses', savedResult);
    } else savedResult = (await request('/responses', {body:submission})).item;
    page = 'results'; showPage();
  } catch (error) {
    status(`尚未确认提交成功：${error.message}。回答仍保留在当前页面，请稍后重试。`);
    document.querySelectorAll('.actions button').forEach(b => b.disabled = false);
  } finally {busy = false;}
}
function scoreCards(scores, selectedKeys) {
  return `<div class="score-list">${selectedKeys.map(k => `<div class="score"><span>${dimensions[k].name}</span><b>${fmt(scores[k])}</b><small>/ 5</small><div class="bar-track"><i style="width:${scores[k]/5*100}%"></i></div><details><summary>这项分数是什么意思？</summary><p>${dimensions[k].explanation} 分数越高，本次回答越接近这一描述；3 分是量尺中点，并非人群平均。</p></details></div>`).join('')}</div>`;
}
function radar(scores) {
  const traits = keys.slice(0, 5), center = 180, radius = 108;
  const point = (i, scale) => [center + Math.sin(i*2*Math.PI/5)*radius*scale, center - Math.cos(i*2*Math.PI/5)*radius*scale];
  const points = scale => traits.map((_, i) => point(i, scale).join(',')).join(' ');
  return `<figure class="radar"><svg viewBox="0 0 360 360" role="img" aria-labelledby="radar-title radar-desc"><title id="radar-title">本次五大人格分数图</title><desc id="radar-desc">${traits.map(k => `${dimensions[k].name} ${fmt(scores[k])} 分`).join('，')}。各轴从中心 0 到外圈 5，不代表常模百分位。</desc>${[1,2,3,4,5].map(n => `<polygon class="radar-grid" points="${points(n/5)}"/>`).join('')}${traits.map((_,i) => {const p=point(i,1);return `<line x1="180" y1="180" x2="${p[0]}" y2="${p[1]}" class="radar-grid"/>`;}).join('')}<polygon class="radar-value" points="${traits.map((k,i) => point(i,scores[k]/5).join(',')).join(' ')}"/>${traits.map((k,i) => {const p=point(i,1.37);return `<text x="${p[0]}" y="${p[1]}" text-anchor="middle" dominant-baseline="middle">${dimensions[k].name}</text>`;}).join('')}</svg><figcaption>同一量尺上的五个侧面；形状和面积没有人格优劣含义。</figcaption></figure>`;
}
function renderResults() {
  const scores = savedResult.scores;
  shell(`${heading('你的测评结果', offline ? '离线预览 · 已保存到本机' : '提交成功 · 本次回答摘要')}
    <p>这份结果把你的回答归纳为五个人格侧面和三个 AI 态度侧面。它没有将你分到某种固定类型，也不会给出适合的职业或工作方式。</p>
    <p class="method-note"><strong>如何阅读：</strong>每项为 1–5 分。展开分数卡可查看含义。神经质高分表示更容易感到担忧或情绪波动；风险顾虑高分表示更担心风险，两者都不是疾病或能力判断。</p>
    <section class="results-section"><h2>五大人格</h2>${radar(scores)}${scoreCards(scores, keys.slice(0,5))}</section>
    <section class="results-section"><h2>AI 态度</h2>${scoreCards(scores, keys.slice(5))}</section>
    <details class="method-note"><summary>人格与 AI 态度有什么关系？</summary><p>本项目探索不同人格侧面与 AI 态度是否在多人样本中一起变化。单个人的一份结果无法证明这种关系；研究者只能对样本进行探索性相关分析，不能据此做职业推荐或因果推断。</p><p>人格题为 Mini-IPIP 的项目中文翻译，AI 题为自编探索题组；本结果不是已验证的个人评估报告。</p></details>
    <hr><section class="feedback-panel"><div class="section-kicker">完成后 · 可选反馈</div><h2>帮助我们改进测评</h2>
    ${feedbackSubmission?.saved ? '<p>本次反馈已保存，谢谢！</p>' : `<p>请选择你对下列描述的同意程度：1 非常不同意，5 非常同意。也可以直接结束。</p><form id="feedbackForm">${Object.entries(feedbackFields).map(([k,label]) => `<label class="feedback-question" for="feedback-${k}">${label}<select id="feedback-${k}" name="${k}" required><option value="">请选择</option>${[1,2,3,4,5].map(n=>`<option value="${n}">${n}</option>`).join('')}</select></label>`).join('')}<label for="feedbackComment">喜欢什么？哪里不清楚？希望如何改进？</label><textarea id="feedbackComment" maxlength="2000" rows="3" placeholder="可不填写，请勿包含姓名或联系方式。"></textarea><p id="status" class="status" role="status"></p><button type="submit" id="saveFeedback">提交反馈</button></form>`}</section>
    <div class="actions"><button id="finish" class="secondary">结束测评</button></div>`);
  document.querySelector('#finish').onclick = () => {page='thanks';showPage();};
  document.querySelector('#feedbackForm')?.addEventListener('submit', saveFeedback);
}
async function saveFeedback(event) {
  event.preventDefault(); if (busy) return;
  const values = Object.fromEntries(Object.keys(feedbackFields).map(k=>[k,Number(document.querySelector(`#feedback-${k}`).value)]));
  const {rating, ...ratings} = values;
  const body = {participantId, rating, ratings, comment:document.querySelector('#feedbackComment').value.trim()};
  const signature = JSON.stringify(body);
  if (!feedbackSubmission || feedbackSubmission.signature !== signature) feedbackSubmission = {...body, id:newId(), signature};
  const {signature:_, ...item} = feedbackSubmission;
  busy = true; document.querySelector('#saveFeedback').disabled = true;
  try {
    if (offline) storeLocal('assessmentFeedback', {...item, submittedAt:new Date().toISOString()});
    else await request('/feedback', {body:item});
    feedbackSubmission.saved = true; page='thanks'; showPage();
  } catch (error) {status(`反馈尚未保存：${error.message}，可以重试。`);document.querySelector('#saveFeedback').disabled=false;}
  finally {busy=false;}
}
function adminLogin(message = '') {
  if (offline) return loadAdmin();
  shell(`${heading('研究者登录', '研究者空间')}<p>输入研究者密码后查看汇总与导出记录。该入口和普通测评使用同一网站。</p><form id="loginForm"><label for="adminToken">研究者密码</label><input id="adminToken" type="password" required autocomplete="current-password"><p class="muted">密码对应部署环境的 ADMIN_TOKEN，由项目负责人保管。</p><p id="status" class="status" role="status">${esc(message)}</p><div class="actions"><button id="loginButton">登录</button><a class="button-link secondary" href="index.html">返回首页</a></div></form>`);
  document.querySelector('#loginForm').onsubmit = event => {event.preventDefault();sessionStorage.setItem('adminToken',document.querySelector('#adminToken').value.trim());loadAdmin();};
}
async function loadAdmin() {
  shell(`${heading('正在读取汇总…','研究者空间')}<p role="status">请稍候。</p>`);
  try {
    const payload = offline ? {responses:readLocal('assessmentResponses'), feedback:readLocal('assessmentFeedback')} : await request('/summary',{admin:true});
    dashboard = summarize(payload); renderAdmin();
  } catch (error) {
    if (error.status === 401) {sessionStorage.removeItem('adminToken');return adminLogin(error.message);}
    shell(`${heading('暂时无法读取服务器数据','研究者空间')}<p class="warning">${esc(error.message)}。请重试；此时不显示本机缓存，避免误认为服务器汇总。</p><div class="actions"><button id="retry">重试</button><a href="index.html">返回首页</a></div>`);
    document.querySelector('#retry').onclick=loadAdmin;
  }
}
function renderAdmin() {
  const d = dashboard;
  shell(`${heading('研究者汇总','研究者空间')}
    ${offline?'<p class="warning">仅显示当前浏览器的离线预览记录，不是公网试点数据。</p>':''}
    <div class="top-metrics"><div><strong>${d.rows.length}</strong><span>有效完成记录</span></div><div><strong>${d.feedback.length}</strong><span>有效反馈记录</span></div><div><strong>${fmt(d.feedbackStats.rating.mean)} / 5</strong><span>整体操作评分 · n=${d.feedbackStats.rating.n}</span></div></div>
    <p class="muted">完成记录数不自动等于独立参与者人数，招募者需核对重复提交与自测。排除合成记录 ${d.synthetic} 条、无效回答 ${d.invalid} 条。所有分数根据原始回答重新计算。</p>
    <div class="actions"><button id="export">导出备份 JSON</button><button id="refresh" class="secondary">刷新汇总</button><button id="logout" class="secondary">退出研究者页面</button></div><p id="status" class="status" role="status"></p>
    <h2>维度平均分</h2>${scoreCards(d.averages, keys).replace(/NaN/g,'0')}
    <h2>维度分数分布</h2><p>均值可能掩盖差异。选择一个维度查看 1–5 分的分布，区间按左闭右开分组，最后一组含 5。</p><label for="distributionKey">选择维度</label><select id="distributionKey">${keys.map(k=>`<option value="${k}">${dimensions[k].name}</option>`).join('')}</select><div id="distribution"></div>
    <h2>每道题回答分布</h2><p class="muted">此表保留原始作答方向；数字表示选择该选项的记录数。“反向”仅说明计分方向。</p><div class="table-wrap"><table><thead><tr><th scope="col">题目</th>${[1,2,3,4,5].map(n=>`<th scope="col">${n}</th>`).join('')}</tr></thead><tbody>${allItems.map(q=>`<tr><th scope="row">${q[0]} ${q[1]}${q[3]?'（反向）':''}</th>${d.itemCounts[q[0]].map(n=>`<td>${n}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
    <h2>探索性分析</h2><p class="method-note">当前 n=${d.rows.length}。本原型在有效记录不足 10 条、方差为零等情况下不显示 α 或相关；达到 10 条只是展示门槛，不代表统计稳定或量表已经验证。</p>
    <h3>各维度 Cronbach α</h3><p>先对反向题统一计分方向，再分别计算内部一致性；不将全部人格题混为一个总量表。</p><div class="alpha-grid">${keys.map(k=>`<div class="alpha-item"><span>${dimensions[k].name}</span><strong>${d.alphas[k]==null?'暂不计算':`α=${fmt(d.alphas[k])}`}</strong></div>`).join('')}</div>
    ${keys.some(k=>d.alphas[k]!=null&&d.alphas[k]<0)?'<p class="warning">部分题组出现负 α。计分方向正确也可能出现负 α，须结合题意、翻译与样本复核，不能为了提高 α 修改已收集的答案。</p>':''}
    <h3>人格与 AI 态度的 Pearson 相关</h3><p>研究问题：在这批试点回答中，人格分数与 AI 态度分数是否呈线性同向或反向变化？下表展示全部 15 组配对，避免只选择最大相关解读。不进行显著性或因果推断。</p><div class="table-wrap"><table><thead><tr><th>人格维度</th>${keys.slice(5).map(k=>`<th>${dimensions[k].name}</th>`).join('')}</tr></thead><tbody>${keys.slice(0,5).map(p=>`<tr><th scope="row">${dimensions[p].name}</th>${keys.slice(5).map(a=>`<td>${fmt(d.correlations[p][a])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
    <h2>综合结论</h2><div class="analysis-summary"><p>本次试点结果显示，参与者的人格维度并不是平均分布的。宜人性最高（3.64），开放性（3.59）和尽责性（3.43）居中，神经质最低（2.66）。这说明在本批样本的回答中，体谅他人、保持开放和处理任务等倾向相对突出，而压力和情绪波动相关的回答较少。不过，这些分数只反映参与者在本次题目中的自我报告，不能说明人格有好坏，也不能据此判断职业适配或个人能力。</p><p>AI 态度结果呈现出较明显的差异。参与者普遍认可 AI 的实际价值，感知效益平均分为 4.18；但信任与采纳平均分为 3.14，明显低于效益评价。这说明参与者可能认为 AI 能提高效率，却不会因此完全信任或持续使用 AI。风险顾虑平均分为 3.45，也说明参与者在认可 AI 价值的同时，对隐私和错误建议保持谨慎。</p><p>人格与 AI 态度的相关结果只能作为探索性线索。宜人性与信任和采纳的相关系数为 0.78，开放性与信任和采纳的相关系数为 0.60，但样本只有 11 人，个别回答可能明显影响结果，不能将其解释为稳定规律或因果关系。</p><p>尽责性维度的 Cronbach’s α 为负，提示题目翻译、反向计分或题目内容仍需复核。综合来看，当前平台适合用于课程项目和探索性分析，不适用于临床诊断、招聘筛选、职业推荐或个人预测。</p></div><h2>根据用户反馈的改进方向</h2><ol class="analysis-summary"><li>让题目更加具体，加入学习、写作、信息检索和工作辅助等场景。</li><li>在明确测量目的的前提下，适度增加题目数量。</li><li>用更直观的图表和简短解释呈现结果。</li><li>说明分数代表什么，以及人格和 AI 态度两部分为什么同时测量。</li><li>评估加入年龄段、职业类别和 AI 使用经验等非身份识别背景问题。</li><li>保留当前简洁清楚的界面，避免增加内容后变得复杂。</li></ol><h3>完成与回答模式</h3><p>记录用时 ${d.timedCount} / ${d.rows.length} 条；平均 ${d.meanDuration==null?'暂无数据':(d.meanDuration/60).toFixed(1)+' 分钟'}。旧版没有记录开始时间，不能倒推出用时或完成率。</p><p>26 题全选同一选项的记录：${d.straightLineCount} 条。该指标只提供复核线索，不能单独判断无效。</p>
    <h2>体验反馈</h2><p class="muted">新版收集五项可选体验评分。旧版只有整体操作评分，其余指标不补填、不与新版样本数混淆。</p><div class="table-wrap"><table><thead><tr><th>指标</th><th>有效反馈 n</th><th>均分 / 5</th></tr></thead><tbody>${Object.entries(feedbackFields).map(([k,label])=>`<tr><th scope="row">${label}</th><td>${d.feedbackStats[k].n}</td><td>${fmt(d.feedbackStats[k].mean)}</td></tr>`).join('')}</tbody></table></div>
    <div class="feedback-list">${d.feedback.map((f,i)=>`<p><strong>反馈 ${i+1}</strong><span class="feedback-rating">${f.rating}/5</span><span class="muted">${esc(f.comment||'未填写文字意见')}</span></p>`).join('')||'<p>尚无反馈。</p>'}</div>
    <p class="method-note">导出文件包含匿名逐题回答及自由文本，请妥善保管导出文件，并检查文字中的身份信息。Render 本地 JSON 不提供长期持久化保证，重新部署前应导出备份。</p>`);
  document.querySelector('#distributionKey').onchange=drawDistribution;
  document.querySelector('#export').onclick=exportBackup;
  document.querySelector('#refresh').onclick=loadAdmin;
  document.querySelector('#logout').onclick=()=>{sessionStorage.removeItem('adminToken');location.href='index.html';};
  drawDistribution();
}
function drawDistribution() {
  const key=document.querySelector('#distributionKey').value;
  const counts=dashboard.distributions[key], maximum=Math.max(1,...counts);
  const labels=['1 ≤ 分数 < 2','2 ≤ 分数 < 3','3 ≤ 分数 < 4','4 ≤ 分数 ≤ 5'];
  document.querySelector('#distribution').innerHTML=`<figure class="histogram"><figcaption>${dimensions[key].name} · n=${counts.reduce((a,b)=>a+b,0)}</figcaption>${counts.map((n,i)=>`<div class="histogram-row"><span>${labels[i]}</span><div><i style="width:${n/maximum*100}%"></i></div><strong>${n}</strong></div>`).join('')}</figure>`;
}
async function exportBackup() {
  try {
    const payload=offline?{responses:readLocal('assessmentResponses'),feedback:readLocal('assessmentFeedback')}:await request('/summary',{admin:true});
    const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));
    const anchor=document.createElement('a');anchor.href=url;anchor.download=`assessment-backup-${new Date().toISOString().slice(0,10)}.json`;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    status('已生成备份文件，请确认浏览器下载完成。');
  } catch (error) {status(`导出失败：${error.message}。`);}
}
if (page==='admin' && token()) loadAdmin(); else render();
