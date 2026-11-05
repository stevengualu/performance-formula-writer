/**
 * Client half of the performance-formula-writer bundle.
 *
 * Registers two slots that address each other by the same id:
 *  - `sidebar.panellist` (id)      the left-column entry and its glyph
 *  - `main` (key)                  the workbook rendered in the centre column
 *
 * The workbook implements the "绩效衡量标准转算分公式" rules:
 * six scoring types (A–F), the built-in 31-rule library, the seven-column
 * configuration table, the extra-variable table and the open-questions table.
 * Everything is computed locally in the page; nothing leaves the browser.
 */
window.__ModuleLoader__.load({
  id: '@local/dsh-performance-formula-writer',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const NS = 'perf-formula';
    const PANEL_ID = 'perf-formula-writer';
    const RATE = '考核项.完成值/考核项.目标值*100';

    /* ENGINE:BEGIN */

    /* ------------------------------------------------------------------ */
    /* locale                                                              */
    /* ------------------------------------------------------------------ */

    const zh = {
      title: '绩效算分公式撰写',
      subtitle: '把绩效衡量标准转成可直接配置的算分公式：满分 / 目标值 / 完成值两字段口径',
      badge: '本地计算 · 不上传',
      'section.input': '指标与衡量标准',
      'label.mark': '得分上限（满分）',
      'hint.mark': '必填。常用 120 分；不同指标可在行首用 [120] 单独指定满分。',
      'label.text': '衡量标准',
      'hint.format': '一行一条：指标描述 | 衡量标准；也支持“指标：标准”，或只写标准（自动命名）。',
      'placeholder.text': '例：入库合格率 | 入库合格率较目标值每低0.1个百分点扣20分，扣完为止',
      'btn.generate': '生成公式',
      'btn.sample': '载入示例',
      'btn.clear': '清空',
      'btn.copy': '复制 Markdown',
      'btn.copied': '已复制',
      'err.mark': '得分上限（满分）需为 1–1000 之间的数字。',
      'err.empty': '请先输入至少一条衡量标准。',
      'err.calc': '解析失败：',
      'err.copy': '复制失败，请手动选中表格内容复制。',
      'tab.result': '生成结果',
      'tab.library': '标准规则库（31 条）',
      'result.title': '配置表',
      'result.rows': '指标 ',
      'result.libHits': '命中标准库 ',
      'result.questions': '疑问 ',
      'empty.title': '从一段衡量标准开始',
      'empty.body': '按绩效系统的两字段口径（目标值、完成值）把规则翻译成公式。',
      'empty.s1': '在左侧输入指标与衡量标准，一行一条。',
      'empty.s2': '确认得分上限（满分），常用 120 分。',
      'empty.s3': '点击“生成公式”，得到七列配置表与疑问复列，可一键复制 Markdown。',
      'table.seq': '序号',
      'table.desc': '指标描述',
      'table.standard': '衡量标准',
      'table.type': '类型',
      'table.rule': '计算规则名称',
      'table.formula': '公式',
      'table.unit': '计量单位',
      legend: '满 = 本指标满分；完 = 完成值；目 = 目标值；考核项.完成值 / 考核项.目标值 = 系统达成率；MAX/MIN/IF/FLOOR = 取大 / 取小 / 条件 / 向下取整',
      'extra.title': '额外变量汇总表',
      'extra.desc': '指标描述',
      'extra.name': '变量',
      'extra.kind': '变量类型',
      'extra.note': '说明',
      'question.title': '疑问指标单独复列',
      'question.point': '疑问点',
      'question.current': '当前口径',
      'question.pending': '待确认',
      'library.intro': '内置 31 条标准计算规则。命中后采用其名称；公式封顶与该指标满分一致时原样采用，不一致时按满分套用同构模板。',
      'library.id': '序号',
      'library.name': '标准计算规则名称',
      'library.type': '类型',
      'library.formula': '对应公式',
      'badge.library': '标准库',
      'note.system': '得分下限 0（扣完为止）；公式中的 满 / 完 / 目 按系统字段名替换。',
    };

    const en = {
      title: 'Performance Formula Writer',
      subtitle: 'Turn measurement criteria into configurable formulas, using only a target value and a completion value',
      badge: 'Computed locally',
      'section.input': 'Indicators and criteria',
      'label.mark': 'Maximum score',
      'hint.mark': 'Required. Usually 120; prefix a line with [120] to override it.',
      'label.text': 'Measurement criteria',
      'hint.format': 'One line per item: name | criteria. “name: criteria” and criteria-only lines also work.',
      'placeholder.text': 'e.g. Inbound pass rate | Each 0.1 point below target deducts 20 points, floored at 0',
      'btn.generate': 'Generate formulas',
      'btn.sample': 'Load sample',
      'btn.clear': 'Clear',
      'btn.copy': 'Copy Markdown',
      'btn.copied': 'Copied',
      'err.mark': 'The maximum score must be a number between 1 and 1000.',
      'err.empty': 'Enter at least one measurement criterion.',
      'err.calc': 'Parse failed: ',
      'err.copy': 'Copy failed. Select the table and copy it manually.',
      'tab.result': 'Result',
      'tab.library': 'Rule library (31)',
      'result.title': 'Configuration table',
      'result.rows': 'Indicators ',
      'result.libHits': 'Library matches ',
      'result.questions': 'Questions ',
      'empty.title': 'Start with a block of criteria',
      'empty.body': 'Translate scoring rules into formulas for a system that only stores a target value and a completion value.',
      'empty.s1': 'Enter indicators and criteria on the left, one per line.',
      'empty.s2': 'Confirm the maximum score; 120 is common.',
      'empty.s3': 'Generate the seven-column table plus open questions, then copy it as Markdown.',
      'table.seq': 'No.',
      'table.desc': 'Indicator',
      'table.standard': 'Measurement criteria',
      'table.type': 'Type',
      'table.rule': 'Rule name',
      'table.formula': 'Formula',
      'table.unit': 'Unit',
      legend: '满 = this indicator’s maximum; 完 = completion value; 目 = target value; 考核项.完成值 / 考核项.目标值 = system achievement rate; MAX/MIN/IF/FLOOR = max / min / conditional / floor',
      'extra.title': 'Extra variables',
      'extra.desc': 'Indicator',
      'extra.name': 'Variable',
      'extra.kind': 'Kind',
      'extra.note': 'Note',
      'question.title': 'Open questions, itemised',
      'question.point': 'Question',
      'question.current': 'Current reading',
      'question.pending': 'To confirm',
      'library.intro': 'The 31 built-in standard rules. A match adopts the rule name; the library formula is used verbatim when its cap equals this indicator’s maximum, otherwise an equivalent template is generated for that maximum.',
      'library.id': 'No.',
      'library.name': 'Standard rule name',
      'library.type': 'Type',
      'library.formula': 'Formula',
      'badge.library': 'Library',
      'note.system': 'Score floor is 0. Replace 满 / 完 / 目 with the system field names.',
    };

    /* ------------------------------------------------------------------ */
    /* standard rule library (31 entries)                                  */
    /* ------------------------------------------------------------------ */

    const LIBRARY = [
      { id: 1, type: 'E', cap: 120, name: '完成率≥100%（完成值≥目标值）得满分；每低10个百分点扣1分，扣完为止', formula: 'IF(' + RATE + '>=100, 120, MAX(120-FLOOR((100-' + RATE + ')/10)*1, 0))' },
      { id: 2, type: 'C', cap: 120, name: '完成值/目标值，上限120，下限0，按区间给分', formula: 'IF(' + RATE + '>=120, 120, IF(' + RATE + '>=90, 100, IF(' + RATE + '>=80, 80, IF(' + RATE + '>=60, 60, 0))))' },
      { id: 3, type: 'E', cap: 120, name: '完成率=完成值/目标值×100，≥90%认定为完成', formula: 'IF(' + RATE + '>=90, 120, 0)' },
      { id: 4, type: 'E', cap: 120, name: '完成得满分；未完成得0分', formula: 'IF(考核项.完成值>=考核项.目标值, 120, 0)' },
      { id: 5, type: 'B', cap: null, skip: true, name: '每低0.1个百分点扣1分', formula: 'IF(考核项.完成值>=考核项.目标值, 1.25, MAX(1.25-(考核项.目标值-考核项.完成值)*10, 0))' },
      { id: 6, type: 'A', cap: 120, name: '每月≥1次投诉扣5分；年度投诉>3次每超1次扣2分，扣完为止', formula: 'MAX(120 - IF(考核项.完成值>=1, 5, 0) - IF(考核项.完成值>3, (考核项.完成值-3)*2, 0), 0)' },
      { id: 7, type: 'B', cap: 120, name: '每低于目标值0.1个百分点扣1分，扣完为止', formula: 'MAX(MIN(120, 100+(考核项.完成值-考核项.目标值)*10), 0)' },
      { id: 8, type: 'B', cap: 120, name: '每低0.01个百分点扣10分、每高加10分，上限120', formula: 'MIN(MAX(100+(' + RATE + '-100)*1000, 0), 120)' },
      { id: 9, type: 'B', cap: 120, name: '≥100%得120，每超10个百分点加1分；每低10个百分点扣1分，扣完为止', formula: 'MIN(MAX(120+FLOOR((' + RATE + '-100)/10)*1, 0), 120)' },
      { id: 10, type: 'B', cap: 120, name: '≥100%得120，每超5个百分点加1分；每低5个百分点扣1分，扣完为止', formula: 'MIN(MAX(120+FLOOR((' + RATE + '-100)/5)*1, 0), 120)' },
      { id: 11, type: 'E', cap: 120, name: '完成率≥90%认定完成，得权重满分', formula: 'IF(' + RATE + '>=90, 120, MIN(' + RATE + ', 120))' },
      { id: 12, type: 'D', cap: 120, name: '完成值/目标值，上限120，下限0', formula: 'Def(a, 考核项.完成值 / 考核项.目标值 * 100); MAX(MIN(a, 120), 0)' },
      { id: 13, type: 'B', cap: 100, name: '每超1个百分点扣10分', formula: 'MAX(MIN(100, 100-(考核项.完成值-考核项.目标值)*10), 0)' },
      { id: 14, type: 'B', cap: 100, name: '每低5个百分点扣10分', formula: 'MAX(MIN(100, 100+(考核项.完成值-考核项.目标值)*2), 0)' },
      { id: 15, type: 'A', cap: 100, name: '每次扣20分', formula: 'MAX(100-考核项.完成值*20, 0)' },
      { id: 16, type: 'A', cap: 100, name: '每项扣10分', formula: 'MAX(100-考核项.完成值*10, 0)' },
      { id: 17, type: 'A', cap: 100, name: '每次扣10分', formula: 'MAX(100-考核项.完成值*10, 0)' },
      { id: 18, type: 'B', cap: 100, name: '每低1个百分点扣3.5分', formula: 'MAX(MIN(100, 100+(考核项.完成值-考核项.目标值)*3.5), 0)' },
      { id: 19, type: 'A', cap: 100, name: '每单扣7分', formula: 'MAX(100-考核项.完成值*7, 0)' },
      { id: 20, type: 'B', cap: 100, name: '每超0.5个百分点扣7分', formula: 'MAX(MIN(100, 100-(考核项.完成值-考核项.目标值)*14), 0)' },
      { id: 21, type: 'B', cap: 110, name: '每低1个百分点扣1分，每超1个百分点加1分，上限110分', formula: 'MIN(MAX(100+(考核项.完成值-考核项.目标值)*1, 0), 110)' },
      { id: 22, type: 'A', cap: 100, name: '每次扣5分', formula: 'MAX(100-考核项.完成值*5, 0)' },
      { id: 23, type: 'A', cap: 100, name: '每次扣30分', formula: 'MAX(100-考核项.完成值*30, 0)' },
      { id: 24, type: 'B', cap: 100, name: '每低1个百分点扣10分', formula: 'MAX(MIN(100, 100+(考核项.完成值-考核项.目标值)*10), 0)' },
      { id: 25, type: 'B', cap: 100, name: '每低1个百分点扣5分', formula: 'MAX(MIN(100, 100+(考核项.完成值-考核项.目标值)*5), 0)' },
      { id: 26, type: 'B', cap: 100, name: '每超1个百分点扣20分', formula: 'MAX(MIN(100, 100-(考核项.完成值-考核项.目标值)*20), 0)' },
      { id: 27, type: 'A', cap: 100, name: '每次扣30分', formula: 'MAX(100-考核项.完成值*30, 0)' },
      { id: 28, type: 'B', cap: 100, name: '每超0.05个百分点扣20分', formula: 'MAX(MIN(100, 100-(考核项.完成值-考核项.目标值)*400), 0)' },
      { id: 29, type: 'B', cap: 100, name: '每低0.1个百分点扣20分', formula: 'MAX(MIN(100, 100+(考核项.完成值-考核项.目标值)*200), 0)' },
      { id: 30, type: 'D', cap: null, name: '加减分，直接取完成值', formula: '考核项.完成值' },
      { id: 31, type: 'D', cap: null, name: '完成值/完成率×100', formula: 'ROUND(考核项.完成值 / 考核项.目标值 * 100, 2)' },
    ];

    const BY_ID = {};
    for (const rule of LIBRARY) BY_ID[rule.id] = rule;

    const SIGNATURES = {
      'dev:low:0.1:1': 7,
      'dev:low:0.1:20': 29,
      'dev:high:1:10': 13,
      'dev:low:5:10': 14,
      'dev:low:1:3.5': 18,
      'dev:high:0.5:7': 20,
      'dev:low:1:10': 24,
      'dev:low:1:5': 25,
      'dev:high:1:20': 26,
      'dev:high:0.05:20': 28,
      'event:次:20': 15,
      'event:项:10': 16,
      'event:次:10': 17,
      'event:次:5': 22,
      'event:次:30': 23,
      'event:单:7': 19,
    };

    /* ------------------------------------------------------------------ */
    /* helpers                                                             */
    /* ------------------------------------------------------------------ */

    function num(value) {
      const n = Number(value);
      if (!Number.isFinite(n)) return String(value);
      return String(Math.round(n * 1e6) / 1e6);
    }

    function normText(text) {
      return String(text)
        .replace(/\s+/g, '')
        .replace(/[，。；、,;：:]/g, '')
        .replace(/扣完为止$/, '');
    }

    function hasUnit(compact) {
      return /%|％|百分点|率|比|占比/.test(compact);
    }

    function findVeto(compact) {
      const re = /([^；。，,;、]{2,16}?)(?:本项)?得0分/g;
      let m;
      while ((m = re.exec(compact)) !== null) {
        const condition = m[1];
        if (/[<>=≥≤]|\d/.test(condition)) continue;
        if (/未完成|未达成|不达标|未达/.test(condition)) continue;
        return condition;
      }
      return null;
    }

    function classifySubject(compact) {
      const m = /([\u4e00-\u9fa5]{2,8}(?:率|比|额|数|量|时长|周期|占比))/.exec(compact);
      return m ? m[1] : '';
    }

    /* ------------------------------------------------------------------ */
    /* feature extraction                                                  */
    /* ------------------------------------------------------------------ */

    function extractFeatures(compact, mark) {
      const features = {
        compact: compact,
        percent: hasUnit(compact),
        devs: [],
        adds: [],
        events: [],
        range: null,
        veto: findVeto(compact),
        threshold: null,
        tiers: [],
        below: null,
        above: null,
        cap: null,
        rate: /(达成率|完成率)/.test(compact) || /(?:完成值|实际值)\s*[\/÷]\s*目标值/.test(compact),
        direct: null,
        dscore: null,
        subject: classifySubject(compact),
      };

      let m;
      const devRe = /每(低|高|超)(?:于)?(?:目标值|基准值|去年同期)?(\d+(?:\.\d+)?)(?:个)?(?:百分点|%|％)(?:扣|减)(\d+(?:\.\d+)?)分/g;
      while ((m = devRe.exec(compact)) !== null) {
        features.devs.push({ dir: m[1] === '低' ? 'low' : 'high', step: Number(m[2]), deduct: Number(m[3]) });
      }

      const addRe = /每(超|高)(?:于)?(?:目标值|基准值|去年同期)?(\d+(?:\.\d+)?)(?:个)?(?:百分点|%|％)(?:加|增|奖)(\d+(?:\.\d+)?)分/g;
      while ((m = addRe.exec(compact)) !== null) {
        features.adds.push({ step: Number(m[2]), deduct: Number(m[3]) });
      }

      const eventRe = /每(?:发生)?(一)?(次|项|单|人|人次|批次|台|笔|件)(?:扣|减)(\d+(?:\.\d+)?)分/g;
      while ((m = eventRe.exec(compact)) !== null) {
        features.events.push({ unit: m[2], deduct: Number(m[3]) });
      }

      const rangeM = /扣(\d+(?:\.\d+)?)[-~—至](\d+(?:\.\d+)?)分/.exec(compact);
      if (rangeM) features.range = { low: Number(rangeM[1]), high: Number(rangeM[2]) };

      const geRe = /[≥>=]{1,2}(\d+(?:\.\d+)?)/g;
      while ((m = geRe.exec(compact)) !== null) {
        const tail = compact.slice(m.index, m.index + 26);
        if (/满分/.test(tail)) {
          features.threshold = Number(m[1]);
          break;
        }
      }

      const intRe = /(\d+(?:\.\d+)?)(?:个)?(?:百分点|%|％)?[-~—－至到](\d+(?:\.\d+)?)(?:个)?(?:百分点|%|％)?(?:得|计|为)(\d+(?:\.\d+)?)分/g;
      while ((m = intRe.exec(compact)) !== null) {
        features.tiers.push({ lo: Number(m[1]), hi: Number(m[2]), score: Number(m[3]) });
      }

      const belowLt = /[<＜]\s*(\d+(?:\.\d+)?)(?:个)?(?:百分点|%|％)?(?:得|计|为)(\d+(?:\.\d+)?)分/.exec(compact);
      const belowKw = /(\d+(?:\.\d+)?)(?:个)?(?:百分点|%|％)?(?:以下|以内)(?:得|计|为)(\d+(?:\.\d+)?)分/.exec(compact);
      if (belowLt) features.below = { hi: Number(belowLt[1]), score: Number(belowLt[2]) };
      else if (belowKw) features.below = { hi: Number(belowKw[1]), score: Number(belowKw[2]) };

      const aboveRe = /[≥>=]{1,2}\s*(\d+(?:\.\d+)?)(?:个)?(?:百分点|%|％)?(?:以上)?(?:得|计|为)(\d+(?:\.\d+)?)分/g;
      while ((m = aboveRe.exec(compact)) !== null) {
        features.above = { lo: Number(m[1]), score: Number(m[2]) };
      }
      if (!features.above && features.tiers.length >= 2 && features.threshold !== null) {
        features.above = { lo: features.threshold, score: Number(mark) };
      }

      const capM = /(?:上限|封顶|最多|最高)(\d+(?:\.\d+)?)分/.exec(compact);
      if (capM) features.cap = Number(capM[1]);

      if (/直接取完成值|加减分.{0,8}完成值/.test(compact)) features.direct = 'value';
      else if (/完成值.{0,6}[\/÷].{0,6}完成率/.test(compact)) features.direct = 'round';
      else if (/得分\s*[=＝]/.test(compact)) features.direct = 'expr';

      if (features.direct === 'expr') {
        const addSeg = /[≥>=](\d+(?:\.\d+)?)(?:%|％)?[^；;]{0,12}?每超(\d+(?:\.\d+)?)(?:个)?(?:百分点|%|％)?(?:加|增)(\d+(?:\.\d+)?)分/.exec(compact);
        const mid = /(\d+(?:\.\d+)?)[-~—](\d+(?:\.\d+)?)(?:%|％)?得分[=＝]?(?:达成率|完成率)[×*](\d+(?:\.\d+)?)/.exec(compact);
        const low = /[<＜](\d+(?:\.\d+)?)(?:%|％)?得分[=＝]?(?:达成率|完成率)[×*](\d+(?:\.\d+)?)/.exec(compact);
        if (mid && low) {
          features.dscore = {
            top: addSeg ? Number(addSeg[1]) : null,
            addStep: addSeg ? Number(addSeg[2]) : null,
            addDeduct: addSeg ? Number(addSeg[3]) : null,
            midLo: Number(mid[1]),
            midHi: Number(mid[2]),
            midMul: Number(mid[3]),
            low: Number(low[1]),
            lowMul: Number(low[2]),
          };
        }
      }

      return features;
    }

    /* ------------------------------------------------------------------ */
    /* formula builders                                                    */
    /* ------------------------------------------------------------------ */

    function deriveUnit(features, type) {
      if (type === 'A') {
        if (features.events.length) return features.events[0].unit;
        const m = /每(次|项|单|人|人次|批次|台|笔|件)/.exec(features.compact || '');
        return m ? m[1] : '次';
      }
      if (features.rate || features.percent) return '%（百分点）';
      return '数值';
    }

    function buildTierName(segs, below, above) {
      const parts = [];
      if (below) parts.push('<' + num(below.hi) + '得' + num(below.score));
      for (const seg of segs) parts.push(num(seg.lo) + '–' + num(seg.hi) + '得' + num(seg.score));
      if (above) parts.push('≥' + num(above.lo) + '得' + num(above.score));
      return '按完成值区间阶梯给分：' + parts.join('；');
    }

    function buildFormula(features, mark) {
      const M = num(mark);
      const X = features.rate ? RATE : '完';
      const CENTER = features.rate ? '100' : '目';
      const compactUnit = features.rate || hasUnit('') ? '%（百分点）' : '数值';

      // C: fixed scores per interval
      if (features.tiers.length >= 2) {
        const segs = features.tiers.slice().sort((a, b) => a.lo - b.lo);
        const bounds = [];
        const values = [];
        bounds.push(segs[0].lo);
        values.push(features.below ? features.below.score : 0);
        for (let i = 1; i < segs.length; i += 1) {
          bounds.push(segs[i].lo);
          values.push(segs[i - 1].score);
        }
        const finalScore = features.above ? features.above.score : segs[segs.length - 1].score;
        if (features.above) {
          bounds.push(features.above.lo);
          values.push(segs[segs.length - 1].score);
        }
        let expr = num(finalScore);
        for (let i = bounds.length - 1; i >= 0; i -= 1) {
          expr = 'IF(完<' + num(bounds[i]) + ', ' + num(values[i]) + ', ' + expr + ')';
        }
        return {
          type: 'C',
          formula: expr,
          unit: deriveUnit(features, 'C'),
          name: buildTierName(segs, features.below, features.above),
          notes: features.below
            ? []
            : [{ point: '最低档以下未给出得分', current: '“' + num(segs[0].lo) + '以下”按0分生成', pending: '确认首档以下的得分' }],
        };
      }

      // E: reach the threshold for full marks, then linear or stepped deductions
      if (features.threshold !== null && features.devs.length) {
        const d = features.devs[0];
        const T = num(features.threshold);
        const stepMode = d.step > 1 && Number.isInteger(d.step);
        const formula = stepMode
          ? 'IF(' + X + '>=' + T + ', ' + M + ', MAX(' + M + '-FLOOR((' + T + '-' + X + ')/' + num(d.step) + ')*' + num(d.deduct) + ', 0))'
          : 'IF(' + X + '>=' + T + ', ' + M + ', MAX(' + M + '-(' + T + '-' + X + ')*' + num(d.deduct / d.step) + ', 0))';
        const subject = features.rate ? '完成率' : features.subject || '完成值';
        return {
          type: 'E',
          formula,
          unit: deriveUnit(features, 'E'),
          name: subject + '≥' + T + '%得满分，每低' + num(d.step) + '个百分点扣' + num(d.deduct) + '分',
          notes: [],
        };
      }

      // B: deviation from target
      if (features.devs.length) {
        const d = features.devs[0];
        const k = d.deduct / d.step;
        const unit = deriveUnit(features, 'B');
        if (features.adds.length) {
          const add = features.adds[0];
          const cap = features.cap !== null ? features.cap : mark;
          const positive = d.dir === 'low';
          const sign = positive ? '+' : '-';
          const formula = 'MIN(MAX(' + M + sign + '(' + X + '-' + CENTER + ')*' + num(k) + ', 0), ' + num(cap) + ')';
          return {
            type: 'B',
            formula,
            unit,
            name: '每低' + num(d.step) + '个百分点扣' + num(d.deduct) + '分，每超' + num(add.step) + '个百分点加' + num(add.deduct) + '分，上限' + num(cap) + '分',
            notes: [],
          };
        }
        const positive = d.dir === 'low';
        const formula = positive
          ? 'MAX(MIN(' + M + ', ' + M + '+(' + X + '-' + CENTER + ')*' + num(k) + '), 0)'
          : 'MAX(MIN(' + M + ', ' + M + '-(' + X + '-' + CENTER + ')*' + num(k) + '), 0)';
        return {
          type: 'B',
          formula,
          unit,
          name: (positive ? '每低' : '每超') + num(d.step) + '个百分点扣' + num(d.deduct) + '分，扣完为止',
          notes: [],
        };
      }

      // D: explicit score expression
      if (features.dscore) {
        const ds = features.dscore;
        const cap = features.cap !== null ? features.cap : mark;
        const midExpr = RATE + '*' + num(ds.midMul / 100);
        const lowExpr = RATE + '*' + num(ds.lowMul / 100);
        let formula;
        if (ds.top !== null && ds.addStep !== null && ds.addDeduct !== null) {
          const k = ds.addDeduct / ds.addStep;
          formula = 'MAX(IF(' + RATE + '>=' + num(ds.top) + ', MIN(' + M + '+(' + RATE + '-' + num(ds.top) + ')*' + num(k) + ', ' + num(cap) + '), IF(' + RATE + '>=' + num(ds.midLo) + ', ' + midExpr + ', ' + lowExpr + ')), 0)';
        } else {
          formula = 'MAX(IF(' + RATE + '>=' + num(ds.midLo) + ', ' + midExpr + ', ' + lowExpr + '), 0)';
        }
        const parts = [];
        if (ds.top !== null) parts.push('达成率≥' + num(ds.top) + '%每超' + num(ds.addStep) + '个百分点加' + num(ds.addDeduct) + '分（上限' + num(cap) + '）');
        parts.push(num(ds.midLo) + '–' + num(ds.midHi) + '%得分=达成率×' + num(ds.midMul));
        parts.push('<' + num(ds.low) + '%得分=达成率×' + num(ds.lowMul));
        return { type: 'D', formula, unit: '%（百分点）', name: parts.join('；'), notes: [] };
      }

      if (features.range) {
        return {
          type: 'A',
          formula: 'MAX(' + M + '-完, 0)',
          unit: '分',
          name: '每项扣' + num(features.range.low) + '-' + num(features.range.high) + '分（按重要性评定），完成值填人工评定扣分数',
          notes: [{
            point: '区间扣分无法纯公式自动计算',
            current: '完成值填写人工评定的实际扣分数，公式为 MAX(满 - 完, 0)',
            pending: '确认评定口径与评定人',
          }],
        };
      }

      // A: event deductions
      if (features.events.length) {
        let best = features.events[0];
        for (const event of features.events) if (event.deduct > best.deduct) best = event;
        const multi = new Set(features.events.map((event) => event.deduct)).size > 1;
        const name = multi
          ? '每' + best.unit + '扣' + num(best.deduct) + '分（含多项事件，公式取最高单次扣分）'
          : '每' + best.unit + '扣' + num(best.deduct) + '分，扣完为止';
        return {
          type: 'A',
          formula: 'MAX(' + M + '-完*' + num(best.deduct) + ', 0)',
          unit: best.unit,
          name,
          notes: multi
            ? [{
              point: '一条衡量标准含多种事件且单次扣分值不同',
              current: '公式按最高单次扣分' + num(best.deduct) + '分计算，完成值填事件发生总次数',
              pending: '如需精确，请拆为多条衡量标准',
            }]
            : [],
        };
      }

      if (features.direct === 'value') {
        return { type: 'D', formula: '考核项.完成值', unit: '分', name: '加减分，直接取完成值', notes: [] };
      }
      if (features.direct === 'round') {
        return { type: 'D', formula: 'ROUND(考核项.完成值/考核项.目标值*100, 2)', unit: '%（百分点）', name: '完成值/完成率×100', notes: [] };
      }
      if (features.direct === 'expr') {
        return {
          type: 'D',
          formula: 'MAX(MIN(' + RATE + ', ' + M + '), 0)',
          unit: '%（百分点）',
          name: '按达成率折算，上限满分，下限 0',
          notes: [{
            point: '规则含“得分=”表达式，但未识别出分段条件',
            current: '按“完成值/目标值×100，上限满分”生成通用公式',
            pending: '请补充分段条件与各档系数',
          }],
        };
      }

      // pure veto without any scoring rule
      if (features.veto) {
        return { type: 'F', formula: M, unit: '数值', name: '未触发否决时得满分', notes: [] };
      }

      return null;
    }

    /* ------------------------------------------------------------------ */
    /* library matching                                                    */
    /* ------------------------------------------------------------------ */

    function matchLibrary(compact, features) {
      const specials = [
        [/每月[^；;]{0,10}投诉[^；;]{0,24}年度投诉/, 6],
        [/完成率[^；;]{0,6}[≥>=]\s*90[^；;]{0,10}认定完成/, 3],
        [/完成值[^；;]{0,4}目标值[^；;]{0,12}上限120[^；;]{0,8}下限0/, 12],
        [/完成率[^；;]{0,4}[≥>=]\s*120[^；;]{0,30}[≥>=]\s*90[^；;]{0,24}[≥>=]\s*80/, 2],
        [/每低0\.01[^；;]{0,24}每高[^；;]{0,12}加[^；;]{0,12}上限120/, 8],
        [/[≥>=]\s*100[^；;]{0,12}每超10[^；;]{0,30}每低10/, 9],
        [/[≥>=]\s*100[^；;]{0,12}每超5[^；;]{0,30}每低5/, 10],
        [/完成率[^；;]{0,6}[≥>=]\s*90[^；;]{0,10}权重满分/, 11],
        [/每低1[^；;]{0,12}加1[^；;]{0,12}上限110/, 21],
        [/直接取完成值/, 30],
        [/完成值[^；;]{0,8}完成率[^；;]{0,8}[×*]\s*100/, 31],
        [/完成[^；;]{0,6}得满分[^；;]{0,20}(?:未完成|未达成)[^；;]{0,10}(?:0分|得0分)/, 4],
      ];
      for (let i = 0; i < specials.length; i += 1) {
        if (specials[i][0].test(compact)) return BY_ID[specials[i][1]];
      }

      const norm = normText(compact);
      let partial = null;
      for (const entry of LIBRARY) {
        if (entry.skip) continue;
        const name = normText(entry.name);
        if (name.length >= 8 && norm === name) return entry;
        if (name.length >= 10 && norm.indexOf(name) >= 0) {
          if (!partial || name.length > normText(partial.name).length) partial = entry;
        }
      }
      if (partial) return partial;

      if (features.devs.length === 1 && features.adds.length === 1) {
        const d = features.devs[0];
        const a = features.adds[0];
        if (d.dir === 'low' && d.step === 1 && d.deduct === 1 && a.step === 1 && a.deduct === 1) return BY_ID[21];
      }
      if (features.devs.length === 1 && !features.adds.length) {
        const d = features.devs[0];
        const hit = SIGNATURES['dev:' + d.dir + ':' + d.step + ':' + d.deduct];
        if (hit) return BY_ID[hit];
      }
      if (!features.devs.length && features.events.length === 1) {
        const e = features.events[0];
        const hit = SIGNATURES['event:' + e.unit + ':' + e.deduct];
        if (hit) return BY_ID[hit];
      }
      return null;
    }

    /* ------------------------------------------------------------------ */
    /* per-line analysis                                                   */
    /* ------------------------------------------------------------------ */

    function analyzeOne(entry, seq) {
      const compact = entry.standard.replace(/\s+/g, '');
      const features = extractFeatures(compact, entry.mark);
      const built = buildFormula(features, entry.mark);
      const lib = matchLibrary(compact, features);
      const notes = built && built.notes ? built.notes.slice() : [];
      const extraVars = [];

      let formula;
      let ruleName;
      let unit;
      let finalType;

      if (lib && (lib.cap === null || lib.cap === entry.mark)) {
        formula = lib.formula;
        ruleName = lib.name;
        finalType = lib.type;
        unit = built ? built.unit : deriveUnit(features, lib.type);
      } else if (built) {
        formula = built.formula;
        ruleName = built.name;
        finalType = built.type;
        unit = built.unit;
        if (lib) {
          notes.push({
            point: '标准库近似命中第 ' + lib.id + ' 条，其原式封顶为 ' + lib.cap + ' 分，与本指标满分 ' + num(entry.mark) + ' 分不一致',
            current: '按本指标满分套用同构模板重算公式',
            pending: '如须保留标准库原式（封顶 ' + lib.cap + ' 分），请确认',
          });
        }
      } else if (lib) {
        formula = lib.formula;
        ruleName = lib.name;
        finalType = lib.type;
        unit = deriveUnit(features, lib.type);
        if (lib.cap !== null && lib.cap !== entry.mark) {
          notes.push({
            point: '命中标准库第 ' + lib.id + ' 条，其原式封顶为 ' + lib.cap + ' 分，与本指标满分 ' + num(entry.mark) + ' 分不一致',
            current: '暂按标准库原样输出',
            pending: '请确认是否按满分 ' + num(entry.mark) + ' 分折算',
          });
        }
      } else {
        formula = 'MAX(MIN(' + RATE + ', ' + num(entry.mark) + '), 0)';
        ruleName = '完成值/目标值×100，上限满分，下限 0';
        finalType = 'D';
        unit = '%（百分点）';
        notes.push({
          point: '未识别到明确的算分规则',
          current: '按“完成值/目标值×100，上限满分，下限 0”生成通用公式',
          pending: '请补充扣分步长、扣分值或区间分数后重新生成',
        });
      }

      if (features.veto) {
        finalType = 'F';
        formula = 'IF(' + features.veto + ', 0, ' + formula + ')';
        ruleName = features.veto + '得0分；' + ruleName;
        extraVars.push({
          name: features.veto,
          kind: '布尔否决条件',
          note: '公式中最外层 IF 条件，需系统额外字段或人工标记承载',
        });
        notes.push({
          point: '“' + features.veto + '”是否决条件，系统没有现成字段',
          current: '已在公式最外层以同名条件表达否决语义',
          pending: '确认是否有可承载该标记的字段；若语义为“本项不计分/权重置零”请另行配置',
        });
      } else if (built && features.events.length && (features.devs.length || features.tiers.length >= 2)) {
        finalType = 'F';
        notes.push({
          point: '同时包含事件扣分与目标偏差（或区间）扣分，系统仅有完成值一个输入',
          current: '已按两字段约束删除事件扣分，仅保留目标偏差部分',
          pending: '如须保留事件扣分，请拆为独立指标',
        });
      }

      if (features.rate && /(?:率|占比)\s*[=＝][^；。]*[\/÷]/.test(compact)) {
        notes.push({
          point: '衡量标准给出了完成值的子口径',
          current: '公式分母仍按“考核项.目标值”的目标口径',
          pending: '确认子口径仅用于说明完成值如何取得',
        });
      }

      return {
        seq,
        desc: entry.desc,
        standard: entry.standard,
        type: finalType,
        rule: ruleName,
        formula,
        unit,
        libId: lib ? lib.id : null,
        mark: entry.mark,
        notes,
        extraVars,
      };
    }

    /* ------------------------------------------------------------------ */
    /* document analysis                                                   */
    /* ------------------------------------------------------------------ */

    function parseEntryLine(line, defaultMark, seq) {
      let rest = line;
      let mark = defaultMark;
      const markM = /^[[【(（]\s*(\d+(?:\.\d+)?)\s*分?\s*[\]】)）]\s*/.exec(rest);
      if (markM) {
        mark = Number(markM[1]);
        rest = rest.slice(markM[0].length);
      }

      let desc = '';
      let standard = rest;
      const pipe = /^([^|｜]{1,32})[|｜]\s*([\s\S]+)$/.exec(rest);
      const colon = /^([^：:]{1,24})[：:]\s*([\s\S]+)$/.exec(rest);
      if (pipe) {
        desc = pipe[1].trim();
        standard = pipe[2].trim();
      } else if (colon && !/(每|扣|得|≥|≤)/.test(colon[1])) {
        desc = colon[1].trim();
        standard = colon[2].trim();
      }
      if (!standard) standard = rest;
      if (!desc) {
        const subject = classifySubject(standard);
        const head = standard.split(/[，,；;。]/)[0] || standard;
        desc = subject || (head.length > 18 ? head.slice(0, 18) + '…' : head) || '指标 ' + seq;
      }
      return { desc, standard, mark };
    }

    function analyzeDocument(text, defaultMark) {
      const lines = String(text).split(/\r?\n/);
      const rows = [];
      const extras = [];
      const questions = [];
      let seq = 0;
      for (const raw of lines) {
        const line = raw.trim();
        if (!line || line.indexOf('#') === 0 || line.indexOf('//') === 0) continue;
        seq += 1;
        const entry = parseEntryLine(line, defaultMark, seq);
        let row;
        try {
          row = analyzeOne(entry, seq);
        } catch (error) {
          row = {
            seq,
            desc: entry.desc,
            standard: entry.standard,
            type: 'D',
            rule: '解析异常',
            formula: '',
            unit: '数值',
            libId: null,
            mark: entry.mark,
            notes: [{
              point: '该行解析失败：' + (error && error.message ? error.message : String(error)),
              current: '未生成公式',
              pending: '请简化该行表述后重试',
            }],
            extraVars: [],
          };
        }
        rows.push(row);
        for (const variable of row.extraVars) {
          extras.push({ seq: row.seq, desc: row.desc, name: variable.name, kind: variable.kind, note: variable.note });
        }
        for (const note of row.notes) {
          questions.push({ seq: row.seq, desc: row.desc, point: note.point, current: note.current, pending: note.pending });
        }
      }
      let libHits = 0;
      for (const row of rows) if (row.libId !== null) libHits += 1;
      return { mark: defaultMark, rows, extras, questions, libHits };
    }

    /* ------------------------------------------------------------------ */
    /* markdown export                                                     */
    /* ------------------------------------------------------------------ */

    function cell(value) {
      return String(value === null || value === undefined ? '' : value)
        .replace(/\|/g, '\\|')
        .replace(/\r?\n/g, ' ');
    }

    function buildMarkdown(result) {
      const out = [];
      out.push('| 序号 | 指标描述 | 衡量标准 | 类型 | 计算规则名称 | 公式 | 计量单位 |');
      out.push('|:---:|---|---|:---:|---|---|---|');
      for (const row of result.rows) {
        out.push('| ' + cell(row.seq) + ' | ' + cell(row.desc) + ' | ' + cell(row.standard) + ' | ' + cell(row.type) + ' | ' + cell(row.rule) + ' | `' + cell(row.formula) + '` | ' + cell(row.unit) + ' |');
      }
      if (result.extras.length) {
        out.push('');
        out.push('**额外变量汇总表**');
        out.push('');
        out.push('| 序号 | 指标描述 | 变量 | 变量类型 | 说明 |');
        out.push('|:---:|---|---|---|---|');
        for (const item of result.extras) {
          out.push('| ' + cell(item.seq) + ' | ' + cell(item.desc) + ' | ' + cell(item.name) + ' | ' + cell(item.kind) + ' | ' + cell(item.note) + ' |');
        }
      }
      if (result.questions.length) {
        out.push('');
        out.push('**疑问指标单独复列**');
        out.push('');
        out.push('| 序号 | 指标描述 | 疑问点 | 当前口径 | 待确认 |');
        out.push('|:---:|---|---|---|---|');
        for (const item of result.questions) {
          out.push('| ' + cell(item.seq) + ' | ' + cell(item.desc) + ' | ' + cell(item.point) + ' | ' + cell(item.current) + ' | ' + cell(item.pending) + ' |');
        }
      }
      return out.join('\n');
    }

    /* ENGINE:END */

    /* ------------------------------------------------------------------ */
    /* sample input                                                        */
    /* ------------------------------------------------------------------ */

    const SAMPLE = [
      '销售达成率·当月 | 达成率≥100%每超1个百分点加1分（上限120）；85-100%得分=达成率×100；<85%得分=达成率×80',
      '入库合格率 | 入库合格率较目标值每低0.1个百分点扣20分，扣完为止',
      '招聘完成率·当月 | 招聘完成率≥90%得满分，每低5个百分点扣10分',
      '破损率控制 | 破损率每超0.05个百分点扣20分',
      '数据差错 | 数据差错每次扣5分',
      '签约率阶梯 | 签约率<20%得0分，20-25%得80分，25-30%得90分，30-35%得100分，≥35%得110分',
      '客户投诉 | 每月≥1次投诉扣5分；年度投诉>3次每超1次扣2分，扣完为止',
      '回款率·季度 | 回款率每低1个百分点扣3.5分',
      '[100] 出入库与盘点管理·当月 | GSP检查未通过本项得0分；安全操作、入库、出库、盘点准确率较目标值每低0.1个百分点扣20分；重要工作节点未按排期完成每次扣30分',
    ].join('\n');

    /* ------------------------------------------------------------------ */
    /* styles                                                              */
    /* ------------------------------------------------------------------ */

    const CSS = [
      '.pfw-root{height:100%;min-height:0;display:flex;flex-direction:column;overflow:hidden;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-size:14px;line-height:1.5}',
      '.pfw-header{flex:none;display:flex;align-items:flex-start;gap:12px;padding:18px 24px 14px;border-bottom:.5px solid var(--dsw-alias-border-l1)}',
      '.pfw-headtext{flex:1;min-width:0}',
      '.pfw-title{margin:0;font-size:17px;font-weight:600;line-height:1.35;letter-spacing:-.01em}',
      '.pfw-subtitle{margin:4px 0 0;font-size:12.5px;color:var(--dsw-alias-label-secondary)}',
      '.pfw-badge{flex:none;align-self:center;font-size:11.5px;padding:4px 9px;border-radius:999px;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);white-space:nowrap}',
      '.pfw-body{flex:1;min-height:0;display:flex}',
      '.pfw-aside{flex:none;width:372px;box-sizing:border-box;border-right:.5px solid var(--dsw-alias-border-l1);padding:18px;overflow:auto;display:flex;flex-direction:column;gap:14px}',
      '.pfw-main{flex:1;min-width:0;overflow:auto;padding:18px 24px 40px}',
      '.pfw-field{display:flex;flex-direction:column;gap:6px}',
      '.pfw-label{font-size:12px;font-weight:600;color:var(--dsw-alias-label-secondary)}',
      '.pfw-hint{margin:0;font-size:11.5px;line-height:1.6;color:var(--dsw-alias-label-secondary)}',
      '.pfw-input,.pfw-textarea{width:100%;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);border-radius:8px;font:inherit;font-size:13px;padding:8px 10px;outline:none;transition:border-color .15s,box-shadow .15s}',
      '.pfw-input:focus,.pfw-textarea:focus{border-color:var(--dsw-alias-brand-primary);box-shadow:0 0 0 2px color-mix(in srgb, var(--dsw-alias-brand-primary) 22%, transparent)}',
      '.pfw-input{width:118px;font-variant-numeric:tabular-nums}',
      '.pfw-textarea{min-height:270px;resize:vertical;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12.5px;line-height:1.65}',
      '.pfw-actions{display:flex;flex-wrap:wrap;gap:8px}',
      '.pfw-btn{font:inherit;font-size:13px;line-height:1.4;padding:7px 14px;border-radius:8px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);cursor:pointer;transition:background .15s,border-color .15s}',
      '.pfw-btn:hover{background:var(--dsw-alias-bg-layer-2)}',
      '.pfw-btn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}',
      '.pfw-btn[disabled]{opacity:.45;cursor:default}',
      '.pfw-btn-primary{border-color:transparent;background:color-mix(in srgb, var(--dsw-alias-brand-primary) 16%, transparent);color:var(--dsw-alias-brand-primary);font-weight:600}',
      '.pfw-btn-primary:hover{background:color-mix(in srgb, var(--dsw-alias-brand-primary) 26%, transparent)}',
      '.pfw-btn-small{padding:5px 11px;font-size:12px}',
      '.pfw-tabs{display:flex;gap:2px;border-bottom:.5px solid var(--dsw-alias-border-l1);margin-bottom:16px}',
      '.pfw-tab{font:inherit;font-size:13px;padding:8px 10px;border:none;border-bottom:2px solid transparent;margin-bottom:-1px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer}',
      '.pfw-tab:hover{color:var(--dsw-alias-label-primary)}',
      '.pfw-tab[data-active="true"]{color:var(--dsw-alias-label-primary);border-bottom-color:var(--dsw-alias-brand-primary);font-weight:600}',
      '.pfw-resulthead{display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap}',
      '.pfw-resulttitle{font-size:14px;font-weight:600}',
      '.pfw-stat{font-size:12px;color:var(--dsw-alias-label-secondary);padding:2px 8px;border-radius:999px;background:var(--dsw-alias-bg-layer-2)}',
      '.pfw-spacer{flex:1}',
      '.pfw-err{margin-bottom:12px;padding:9px 12px;border-radius:8px;font-size:12.5px;color:var(--dsw-alias-state-error-primary);background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 12%, transparent);border:1px solid color-mix(in srgb, var(--dsw-alias-state-error-primary) 32%, transparent)}',
      '.pfw-tablewrap{overflow-x:auto;border:1px solid var(--dsw-alias-border-l1);border-radius:10px;background:var(--dsw-alias-bg-layer-1)}',
      '.pfw-table{border-collapse:collapse;width:100%;min-width:1000px;font-size:12.5px}',
      '.pfw-table th{position:sticky;top:0;z-index:1;background:var(--dsw-alias-bg-layer-2);text-align:left;font-weight:600;color:var(--dsw-alias-label-secondary);padding:9px 10px;border-bottom:1px solid var(--dsw-alias-border-l1);white-space:nowrap}',
      '.pfw-table td{padding:9px 10px;border-bottom:.5px solid var(--dsw-alias-border-l1);vertical-align:top;line-height:1.6}',
      '.pfw-table tr:last-child td{border-bottom:none}',
      '.pfw-table code{display:block;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;line-height:1.6;white-space:pre-wrap;overflow-wrap:anywhere}',
      '.pfw-num{width:44px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}',
      '.pfw-desc{font-weight:600}',
      '.pfw-lib{display:inline-block;margin-top:5px;font-size:10.5px;font-weight:500;padding:1px 6px;border-radius:999px;color:var(--dsw-alias-brand-primary);background:color-mix(in srgb, var(--dsw-alias-brand-primary) 12%, transparent)}',
      '.pfw-nowrap{white-space:nowrap}',
      '.pfw-type{display:inline-block;min-width:16px;text-align:center;font-weight:700;font-size:12px;padding:1px 6px;border-radius:5px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}',
      '.pfw-type[data-type="A"]{color:var(--dsw-alias-state-warn-primary);background:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 14%, transparent)}',
      '.pfw-type[data-type="B"]{color:var(--dsw-alias-brand-primary);background:color-mix(in srgb, var(--dsw-alias-brand-primary) 14%, transparent)}',
      '.pfw-type[data-type="C"]{color:var(--dsw-alias-state-success-primary);background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 14%, transparent)}',
      '.pfw-type[data-type="E"]{color:var(--dsw-alias-state-idle-primary);background:color-mix(in srgb, var(--dsw-alias-state-idle-primary) 16%, transparent)}',
      '.pfw-type[data-type="F"]{color:var(--dsw-alias-state-error-primary);background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 14%, transparent)}',
      '.pfw-legend{margin:10px 0 0;font-size:11.5px;line-height:1.65;color:var(--dsw-alias-label-secondary)}',
      '.pfw-section{margin-top:22px}',
      '.pfw-sectiontitle{margin:0 0 10px;font-size:13px;font-weight:600}',
      '.pfw-sectiontitle[data-tone="warn"]{color:var(--dsw-alias-state-warn-primary)}',
      '.pfw-empty{max-width:520px;padding:26px 24px;border:1px dashed var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-bg-layer-1)}',
      '.pfw-empty-title{font-size:14px;font-weight:600;margin-bottom:6px}',
      '.pfw-empty-body{margin:0 0 12px;font-size:12.5px;color:var(--dsw-alias-label-secondary)}',
      '.pfw-steps{margin:0 0 16px;padding-left:18px;font-size:12.5px;line-height:1.9;color:var(--dsw-alias-label-secondary)}',
      '.pfw-foot{margin-top:auto;padding-top:12px;border-top:.5px solid var(--dsw-alias-border-l1)}',
      '.pfw-libintro{margin:0 0 12px;font-size:12px;line-height:1.7;color:var(--dsw-alias-label-secondary)}',
      '.pfw-libtable{min-width:780px}',
      '@media (max-width:860px){.pfw-body{flex-direction:column}.pfw-aside{width:auto;border-right:none;border-bottom:.5px solid var(--dsw-alias-border-l1)}.pfw-textarea{min-height:180px}}',
    ].join('\n');

    /* ------------------------------------------------------------------ */
    /* UI                                                                  */
    /* ------------------------------------------------------------------ */

    const DRAFT = { text: '', mark: '', result: null };

    function PanelIcon(props) {
      const size = props && props.size ? props.size : 18;
      return h('svg', {
        viewBox: '0 0 24 24',
        width: size,
        height: size,
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.7,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
        focusable: false,
        style: { display: 'block' },
      },
      h('path', { d: 'M13.9 3.6H7.7a1.9 1.9 0 0 0-1.9 1.9v13a1.9 1.9 0 0 0 1.9 1.9h8.6a1.9 1.9 0 0 0 1.9-1.9V8.1z' }),
      h('path', { d: 'M13.9 3.6v3.4a1.1 1.1 0 0 0 1.1 1.1h3.2' }),
      h('path', { d: 'M14.8 11.6h-5.1l2.7 3.1-2.7 3.1h5.1' }));
    }

    function Chip(props) {
      return h('span', { className: 'pfw-type', 'data-type': props.type }, props.type);
    }

    function ResultTable(props) {
      const t = props.t;
      return h('div', { className: 'pfw-tablewrap' },
        h('table', { className: 'pfw-table' },
          h('thead', null, h('tr', null,
            h('th', null, t('table.seq')),
            h('th', null, t('table.desc')),
            h('th', null, t('table.standard')),
            h('th', null, t('table.type')),
            h('th', null, t('table.rule')),
            h('th', null, t('table.formula')),
            h('th', null, t('table.unit')))),
          h('tbody', null, props.rows.map((row) =>
            h('tr', { key: row.seq },
              h('td', { className: 'pfw-num' }, row.seq),
              h('td', null,
                h('div', { className: 'pfw-desc' }, row.desc),
                row.libId !== null
                  ? h('span', { className: 'pfw-lib' }, t('badge.library') + ' #' + row.libId)
                  : null),
              h('td', null, row.standard),
              h('td', null, h(Chip, { type: row.type })),
              h('td', null, row.rule),
              h('td', null, h('code', null, row.formula)),
              h('td', { className: 'pfw-nowrap' }, row.unit))))));
    }

    function ExtraTable(props) {
      const t = props.t;
      return h('div', { className: 'pfw-tablewrap' },
        h('table', { className: 'pfw-table pfw-libtable' },
          h('thead', null, h('tr', null,
            h('th', null, t('table.seq')),
            h('th', null, t('extra.desc')),
            h('th', null, t('extra.name')),
            h('th', null, t('extra.kind')),
            h('th', null, t('extra.note')))),
          h('tbody', null, props.items.map((item, index) =>
            h('tr', { key: index },
              h('td', { className: 'pfw-num' }, item.seq),
              h('td', null, item.desc),
              h('td', null, h('code', null, item.name)),
              h('td', null, item.kind),
              h('td', null, item.note))))));
    }

    function QuestionTable(props) {
      const t = props.t;
      return h('div', { className: 'pfw-tablewrap' },
        h('table', { className: 'pfw-table pfw-libtable' },
          h('thead', null, h('tr', null,
            h('th', null, t('table.seq')),
            h('th', null, t('extra.desc')),
            h('th', null, t('question.point')),
            h('th', null, t('question.current')),
            h('th', null, t('question.pending')))),
          h('tbody', null, props.items.map((item, index) =>
            h('tr', { key: index },
              h('td', { className: 'pfw-num' }, item.seq),
              h('td', null, item.desc),
              h('td', null, item.point),
              h('td', null, item.current),
              h('td', null, item.pending))))));
    }

    function LibraryTab(props) {
      const t = props.t;
      return h('div', null,
        h('p', { className: 'pfw-libintro' }, t('library.intro')),
        h('div', { className: 'pfw-tablewrap' },
          h('table', { className: 'pfw-table pfw-libtable' },
            h('thead', null, h('tr', null,
              h('th', null, t('library.id')),
              h('th', null, t('library.name')),
              h('th', null, t('library.type')),
              h('th', null, t('library.formula')))),
            h('tbody', null, LIBRARY.map((rule) =>
              h('tr', { key: rule.id },
                h('td', { className: 'pfw-num' }, rule.id),
                h('td', null, rule.name),
                h('td', null, h(Chip, { type: rule.type })),
                h('td', null, h('code', null, rule.formula))))))));
    }

    function PanelPage(props) {
      const t = props && props.t ? props.t : function (key) { return key; };
      const [text, setText] = React.useState(DRAFT.text);
      const [mark, setMark] = React.useState(DRAFT.mark);
      const [result, setResult] = React.useState(DRAFT.result);
      const [error, setError] = React.useState('');
      const [tab, setTab] = React.useState('result');
      const [copied, setCopied] = React.useState(false);
      const timer = React.useRef(null);

      React.useEffect(function () {
        return function () {
          if (timer.current !== null) window.clearTimeout(timer.current);
        };
      }, []);

      function updateText(value) {
        DRAFT.text = value;
        setText(value);
      }

      function updateMark(value) {
        DRAFT.mark = value;
        setMark(value);
      }

      function generate() {
        const value = Number(mark);
        if (!Number.isFinite(value) || value <= 0 || value > 1000) {
          setError(t('err.mark'));
          return;
        }
        if (!String(text).trim()) {
          setError(t('err.empty'));
          return;
        }
        let next;
        try {
          next = analyzeDocument(text, value);
        } catch (e) {
          setError(t('err.calc') + (e && e.message ? e.message : String(e)));
          return;
        }
        if (!next.rows.length) {
          setError(t('err.empty'));
          return;
        }
        DRAFT.result = next;
        setResult(next);
        setError('');
        setTab('result');
      }

      function loadSample() {
        DRAFT.text = SAMPLE;
        DRAFT.result = null;
        setText(SAMPLE);
        setResult(null);
        setError('');
      }

      function clearAll() {
        DRAFT.text = '';
        DRAFT.result = null;
        setText('');
        setResult(null);
        setError('');
      }

      function copyMarkdown() {
        if (result === null) return;
        const payload = buildMarkdown(result);
        const done = function () {
          setCopied(true);
          if (timer.current !== null) window.clearTimeout(timer.current);
          timer.current = window.setTimeout(function () { setCopied(false); }, 1800);
        };
        const fail = function () { setError(t('err.copy')); };
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(payload).then(done, fail);
          } else {
            fail();
          }
        } catch (e) {
          fail();
        }
      }

      const aside = h('aside', { className: 'pfw-aside' },
        h('div', { className: 'pfw-field' },
          h('span', { className: 'pfw-label' }, t('label.mark')),
          h('input', {
            className: 'pfw-input',
            type: 'number',
            min: 1,
            max: 1000,
            step: 'any',
            value: mark,
            placeholder: '120',
            onChange: function (event) { updateMark(event.target.value); },
          }),
          h('p', { className: 'pfw-hint' }, t('hint.mark'))),
        h('div', { className: 'pfw-field' },
          h('span', { className: 'pfw-label' }, t('section.input') + ' · ' + t('label.text')),
          h('textarea', {
            className: 'pfw-textarea',
            value: text,
            placeholder: t('placeholder.text'),
            spellCheck: false,
            onChange: function (event) { updateText(event.target.value); },
          }),
          h('p', { className: 'pfw-hint' }, t('hint.format'))),
        h('div', { className: 'pfw-actions' },
          h('button', { type: 'button', className: 'pfw-btn pfw-btn-primary', onClick: generate }, t('btn.generate')),
          h('button', { type: 'button', className: 'pfw-btn', onClick: loadSample }, t('btn.sample')),
          h('button', { type: 'button', className: 'pfw-btn', onClick: clearAll }, t('btn.clear'))),
        h('div', { className: 'pfw-foot' },
          h('p', { className: 'pfw-hint' }, t('note.system'))));

      let content;
      if (tab === 'library') {
        content = h(LibraryTab, { t: t });
      } else if (result === null) {
        content = h('div', { className: 'pfw-empty' },
          h('div', { className: 'pfw-empty-title' }, t('empty.title')),
          h('p', { className: 'pfw-empty-body' }, t('empty.body')),
          h('ol', { className: 'pfw-steps' },
            h('li', null, t('empty.s1')),
            h('li', null, t('empty.s2')),
            h('li', null, t('empty.s3'))),
          h('button', { type: 'button', className: 'pfw-btn', onClick: loadSample }, t('btn.sample')));
      } else {
        content = h('div', null,
          h('div', { className: 'pfw-resulthead' },
            h('span', { className: 'pfw-resulttitle' }, t('result.title')),
            h('span', { className: 'pfw-stat' }, t('result.rows') + result.rows.length),
            h('span', { className: 'pfw-stat' }, t('result.libHits') + result.libHits),
            h('span', { className: 'pfw-stat' }, t('result.questions') + result.questions.length),
            h('span', { className: 'pfw-spacer' }),
            h('button', { type: 'button', className: 'pfw-btn pfw-btn-small', onClick: copyMarkdown }, copied ? t('btn.copied') : t('btn.copy'))),
          h(ResultTable, { rows: result.rows, t: t }),
          h('p', { className: 'pfw-legend' }, t('legend')),
          result.extras.length
            ? h('section', { className: 'pfw-section' },
              h('h3', { className: 'pfw-sectiontitle' }, t('extra.title')),
              h(ExtraTable, { items: result.extras, t: t }))
            : null,
          result.questions.length
            ? h('section', { className: 'pfw-section' },
              h('h3', { className: 'pfw-sectiontitle', 'data-tone': 'warn' }, t('question.title')),
              h(QuestionTable, { items: result.questions, t: t }))
            : null);
      }

      return h('div', { className: 'pfw-root' },
        h('header', { className: 'pfw-header' },
          h('div', { className: 'pfw-headtext' },
            h('h1', { className: 'pfw-title' }, t('title')),
            h('p', { className: 'pfw-subtitle' }, t('subtitle'))),
          h('span', { className: 'pfw-badge' }, t('badge'))),
        h('div', { className: 'pfw-body' },
          aside,
          h('main', { className: 'pfw-main' },
            h('div', { className: 'pfw-tabs', role: 'tablist' },
              h('button', {
                type: 'button', role: 'tab', className: 'pfw-tab',
                'data-active': tab === 'result' ? 'true' : 'false',
                'aria-selected': tab === 'result',
                onClick: function () { setTab('result'); },
              }, t('tab.result')),
              h('button', {
                type: 'button', role: 'tab', className: 'pfw-tab',
                'data-active': tab === 'library' ? 'true' : 'false',
                'aria-selected': tab === 'library',
                onClick: function () { setTab('library'); },
              }, t('tab.library'))),
            error ? h('div', { className: 'pfw-err', role: 'alert' }, error) : null,
            content)));
    }

    /* ------------------------------------------------------------------ */
    /* client plugin                                                       */
    /* ------------------------------------------------------------------ */

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(function () {
          return ctx.locale.register(NS, { zh: zh, en: en });
        }, 'perf-formula: dictionaries');

        const t = ctx.locale.bind(NS);

        ctx.effect(function () {
          const tag = document.createElement('style');
          tag.dataset.plugin = '@local/dsh-performance-formula-writer';
          tag.textContent = CSS;
          document.head.appendChild(tag);
          return function () { tag.remove(); };
        }, 'perf-formula: styles');

        ctx.effect(function () {
          return ctx.slots.inject('sidebar.panellist', function () {
            return ctx.slots.register({
              name: 'sidebar.panellist',
              id: PANEL_ID,
              order: 20,
              label: function () { return t('title'); },
            }, PanelIcon);
          });
        }, 'perf-formula: sidebar entry');

        ctx.effect(function () {
          return ctx.slots.inject('main', function () {
            return ctx.slots.register({
              name: 'main',
              key: PANEL_ID,
              locale: NS,
            }, PanelPage);
          });
        }, 'perf-formula: main panel');
      },
    };
  },
});
