// ============================================================
// RichTextEditor Component – Tiptap Rich Text with Placeholders
// ============================================================
import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { Button, Space, Dropdown, MenuProps, Tooltip } from 'antd';
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  UndoOutlined,
  RedoOutlined,
  TagsOutlined,
} from '@ant-design/icons';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  availablePlaceholders?: string[];
  placeholder?: string;
  readOnly?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  availablePlaceholders = [
    'company_name',
    'company_address',
    'employee_name',
    'employee_id',
    'designation',
    'department',
    'reporting_manager',
    'joining_date',
    'letter_date',
    'effective_date',
    'period',
    'last_working_day',
    'reason_for_letter',
    'authorized_signatory',
    'signatory_designation',
  ],
  placeholder = 'Write letter content here...',
  readOnly = false,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const insertPlaceholder = (key: string) => {
    editor.chain().focus().insertContent(`{{${key}}}`).run();
  };

  const placeholderMenuItems: MenuProps['items'] = availablePlaceholders.map((p) => ({
    key: p,
    label: `{{${p}}}`,
    onClick: () => insertPlaceholder(p),
  }));

  return (
    <div
      style={{
        border: '1px solid #d9d9d9',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
      }}
    >
      {!readOnly && (
        <div
          style={{
            padding: '8px 12px',
            borderBottom: '1px solid #f0f0f0',
            backgroundColor: '#fafafa',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            alignItems: 'center',
          }}
        >
          <Space direction="horizontal" size={4} wrap>
            <Tooltip title="Bold">
              <Button
                size="small"
                type={editor.isActive('bold') ? 'primary' : 'default'}
                icon={<BoldOutlined />}
                onClick={() => editor.chain().focus().toggleBold().run()}
              />
            </Tooltip>
            <Tooltip title="Italic">
              <Button
                size="small"
                type={editor.isActive('italic') ? 'primary' : 'default'}
                icon={<ItalicOutlined />}
                onClick={() => editor.chain().focus().toggleItalic().run()}
              />
            </Tooltip>
            <Tooltip title="Underline">
              <Button
                size="small"
                type={editor.isActive('underline') ? 'primary' : 'default'}
                icon={<UnderlineOutlined />}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
              />
            </Tooltip>
            <Tooltip title="Bullet List">
              <Button
                size="small"
                type={editor.isActive('bulletList') ? 'primary' : 'default'}
                icon={<UnorderedListOutlined />}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
              />
            </Tooltip>
            <Tooltip title="Numbered List">
              <Button
                size="small"
                type={editor.isActive('orderedList') ? 'primary' : 'default'}
                icon={<OrderedListOutlined />}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
              />
            </Tooltip>
            <Tooltip title="Undo">
              <Button
                size="small"
                icon={<UndoOutlined />}
                disabled={!editor.can().undo()}
                onClick={() => editor.chain().focus().undo().run()}
              />
            </Tooltip>
            <Tooltip title="Redo">
              <Button
                size="small"
                icon={<RedoOutlined />}
                disabled={!editor.can().redo()}
                onClick={() => editor.chain().focus().redo().run()}
              />
            </Tooltip>

            {/* Insert Placeholder Dropdown */}
            <Dropdown menu={{ items: placeholderMenuItems }} placement="bottomLeft">
              <Button size="small" icon={<TagsOutlined />} style={{ color: '#1677ff' }}>
                Insert Variable
              </Button>
            </Dropdown>
          </Space>
        </div>
      )}

      <div style={{ padding: '16px', minHeight: '280px', lineHeight: 1.6 }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
