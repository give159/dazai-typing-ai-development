# 根拠一覧（規格・査読済み論文）

**重要**：版・巻号・ページ・内容は、使用前に原典（ISO/IEEE 各機関、出版社、DOI）で確認すること。規格の本文は有償で、ここでは概要レベルの参照にとどめる。規格は考え方の参考であり、準拠の証明ではない。この一覧は作成時にオンライン照合していない。引用に使う前に必ず実在・書誌情報を確認し、確認できないものは載せない。

## 国際規格・国内規格（S）
| 記号 | 規格 | 使いどころ |
|---|---|---|
| S1 | ISO/IEC/IEEE 29148 Requirements engineering | 要求の記述（単一・検証可能・追跡可能）。F1, F4 |
| S2 | ISO/IEC/IEEE 29119-2 Test processes | テストプロセス（計画・設計・実行・報告）。F7, B2, B4 |
| S3 | ISO/IEC/IEEE 29119-4 Test techniques | 同値分割・境界値・デシジョンテーブル等。F4, F6, B2 |
| S4 | ISO/IEC/IEEE 42010 Architecture description | 設計の関心事・視点・決定理由。F1 |
| S5 | ISO/IEC/IEEE 12207 Software life cycle processes | 開発ライフサイクルの各プロセス（統合・検証・情報管理）。F7, F8 |
| S6 | ISO/IEC 25010 Product quality model（2011、2023改訂） | 品質特性での影響確認。全タスク |
| S7 | ISO/IEC/IEEE 828 Configuration management | 版・変更の管理。F8 |
| S8 | ISO/IEC 20246 Work product reviews | レビューの進め方・記録。F9 |
| S9 | IEEE 1028 Software reviews and audits | レビュー形式・役割。F9 |
| S10 | IEEE 1044 Classification for software anomalies | 不具合の分類。B1 |
| S11 | ISO/IEC/IEEE 14764 Software maintenance | 是正保守・問題分析・影響分析。B1, B3, B5 |
| 国内 | JIS X 25010、JSTQB／ISTQB シラバス | 国内文書での参照、用語統一（版の対応は要確認） |

## 査読済み論文（P）※書誌は主要情報のみ。巻号・ページ・DOIは原典で確認
| 記号 | 文献 | 示唆 |
|---|---|---|
| P-Fagan1976 | Fagan, M. E. "Design and code inspections to reduce errors in program development." IBM Systems Journal, 1976 | 形式的インスペクションによる早期の欠陥発見 |
| P-Bacchelli2013 | Bacchelli, A., Bird, C. "Expectations, outcomes, and challenges of modern code review." ICSE 2013 | コードレビューは欠陥発見以外に知識共有・理解の効果も大きい |
| P-Mantyla2009 | Mäntylä, M. V., Lassenius, C. "What types of defects are really discovered in code reviews?" IEEE TSE, 2009 | レビューで見つかる欠陥は保守性・可読性に関するものが多い |
| P-Rigby2013 | Rigby, P. C., Bird, C. "Convergent contemporary software peer review practices." ESEC/FSE 2013 | 現代のレビューは小さい変更・軽量・迅速な傾向 |
| P-Sadowski2018 | Sadowski, C. et al. "Modern code review: a case study at Google." ICSE-SEIP 2018 | 大規模組織でのレビュー運用の実態 |
| P-Zimmermann2010 | Zimmermann, T. et al. "What makes a good bug report?" IEEE TSE, 2010 | 再現手順・スタックトレース等がバグ修正に有用 |
| P-Zeller2002 | Zeller, A., Hildebrandt, R. "Simplifying and isolating failure-inducing input." IEEE TSE, 2002 | 失敗を起こす入力の最小化（切り分け） |
| P-Chillarege1992 | Chillarege, R. et al. "Orthogonal defect classification — a concept for in-process measurements." IEEE TSE, 1992 | 不具合の分類を工程改善に使う |
| P-Sliwerski2005 | Śliwerski, J., Zimmermann, T., Zeller, A. "When do changes induce fixes?" MSR 2005 | 変更が不具合を混入させる／混入箇所の特定 |
| P-Kim2006 | Kim, S. et al. "Automatic identification of bug-introducing changes." ASE 2006 | 修正履歴から混入変更を特定 |
| P-Herzig2013 | Herzig, K., Just, S., Zeller, A. "It's not a bug, it's a feature: how misclassification impacts bug prediction." ICSE 2013 | 不具合の誤分類の影響。分類は慎重に |
| P-Rothermel1996 | Rothermel, G., Harrold, M. J. "Analyzing regression test selection techniques." IEEE TSE, 1996 | 回帰テスト選択の考え方 |
| P-Yoo2012 | Yoo, S., Harman, M. "Regression testing minimization, selection and prioritization: a survey." STVR, 2012 | 回帰テストの縮小・選択・優先順位付けの整理 |
| P-Li2013 | Li, B. et al. "A survey of code-based change impact analysis techniques." STVR, 2013 | 変更影響分析の手法整理 |
| P-Nagappan2008 | Nagappan, N. et al. "Realizing quality improvement through test driven development: results and experiences of four industrial teams." Empirical Software Engineering, 2008 | TDDで欠陥密度が下がった事例（開発時間は増加） |
| P-Rafique2013 | Rafique, Y., Mišić, V. B. "The effects of test-driven development on external quality and productivity: a meta-analysis." IEEE TSE, 2013 | TDDの効果は文脈で異なる（品質に小〜中程度の傾向） |
| P-Parnas1972 | Parnas, D. L. "On the criteria to be used in decomposing systems into modules." CACM, 1972 | 情報隠蔽によるモジュール分割 |
| P-Myers2016 | Myers, B. A., Stylos, J. "Improving API usability." CACM, 2016 | API の使いやすさの設計 |
| P-Qiu2013 | Qiu, D., Li, B., Su, Z. "An empirical analysis of the co-evolution of schema and code in database applications." ESEC/FSE 2013 | スキーマ変更はコードに波及する |
| P-Curino2008 | Curino, C. A. et al. "Schema evolution in Wikipedia: toward a web information system benchmark." ICEIS 2008 | 実システムでのスキーマ進化の実態 |
| P-Abebe2016 | Abebe, S. L., Ali, N., Hassan, A. E. "An empirical study of software release notes." Empirical Software Engineering, 2016 | リリースノートの内容と書き方の実態 |
| P-Jiang2015 | Jiang, Z. M., Hassan, A. E. "A survey on load testing of large-scale software systems." IEEE TSE, 2015 | 性能・負荷テストの手法整理 |

## 使い方の注意
- 論文は特定のプロジェクト・時代の結果。最新のAI支援開発で同じ効果が出る保証はない。自分の環境で効果を評価する。
- 国内の査読論文は、情報処理学会論文誌・電子情報通信学会論文誌・J-STAGE 等で追補する。
