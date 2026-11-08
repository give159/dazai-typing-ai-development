##  ディレクトリ構造と各スキルの役割

1. **`spec-docs/`** ：仕様駆動開発（Specification-Driven）支援コンテキスト
   * **`SKILL.md`**：AIに「仕様書の定義・整合性チェック」の役割を与えるためのメイン指示書。
   * **`references/doc-format.md`**：仕様書（Markdown）に含めるべき必須項目やフォーマットを定義したルールブック。
   * **`scripts/new_spec.py`**：ルールに準拠した仕様書テンプレートを即座に自動生成（ブートストラップ）するスクリプト。
   * **`scripts/check_spec.py`**：記述された仕様書にロジックの破綻やエッジケースの考慮漏れがないかを事前検証するスクリプト。

2. **`feature-bugfix-workflow/`** ：機能開発・バグ修正ワークフローコンテキスト
   * **`SKILL.md`**：AIに「新機能の実装やバグ修正の正確なサイクル」を認知させるためのメイン指示書。
   * **`references/feature-template.md`**：新機能を追加する際、AIが実装方針やタスクを整理するためのMarkdownテンプレート。
   * **`references/bugfix-template.md`**：バグ修正時、AIが原因究明、再現手順、修正方針を論理的にまとめるためのMarkdownテンプレート。
   * **`references/claude-md-snippet.md`**：ワークフローの進捗や状態を `CLAUDE.md` へ動的に記録・更新するためのスニペット集。
   * **`references/standards-and-papers.md`**：開発標準や技術的エビデンスがまとめられた、AI参照用のナレッジベース。

3. **`engineering-method/`** ：アーキテクチャ・品質監査コンテキスト
   * **`SKILL.md`**：AIエージェントに「開発標準・品質ルール」を認知させるためのメイン指示書。
   * **`references/method.md`**：具体的な開発プロセスや設計思想が記述された、AI参照用のサブドキュメント。
   * **`scripts/audit_project.py`**：ディレクトリ構造や依存関係をチェックし、技術負債を検知する検証用Pythonスクリプト。
