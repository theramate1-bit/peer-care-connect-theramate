import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  FileText, 
  X, 
  Smile,
  Reply
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface MessageInputProps {
  conversationId: string;
  onMessageSent: () => void;
  replyToMessage?: {
    id: string;
    content: string;
    senderName: string;
  };
  onCancelReply: () => void;
}

interface FileAttachment {
  file: File;
  id: string;
  type: string;
  size: number;
  preview?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  conversationId,
  onMessageSent,
  replyToMessage,
  onCancelReply
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = async () => {
    if (!user || (!message.trim() && attachments.length === 0)) return;

    try {
      setIsSending(true);

      // For now, we'll store the message as plain text
      // In a real implementation, you would encrypt the message content
      const encryptedContent = message.trim();
      const contentHash = btoa(encryptedContent); // Simple hash for demo

      // Insert the message
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          message_type: attachments.length > 0 ? 'file' : 'text',
          encrypted_content: encryptedContent,
          content_hash: contentHash,
          reply_to_message_id: replyToMessage?.id
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Handle file attachments if any
      if (attachments.length > 0 && messageData) {
        for (const attachment of attachments) {
          // In a real implementation, you would:
          // 1. Upload the file to Supabase Storage
          // 2. Encrypt the file path
          // 3. Generate a hash for integrity verification
          
          const { error: attachmentError } = await supabase
            .from('message_attachments')
            .insert({
              message_id: messageData.id,
              file_name: attachment.file.name,
              file_type: attachment.file.type,
              file_size: attachment.file.size,
              encrypted_file_path: `/uploads/${attachment.file.name}`, // Placeholder
              file_hash: btoa(attachment.file.name), // Placeholder hash
              is_virus_scanned: false
            });

          if (attachmentError) {
            console.error('Error saving attachment:', attachmentError);
          }
        }
      }

      // Clear the input
      setMessage('');
      setAttachments([]);
      if (replyToMessage) {
        onCancelReply();
      }

      // Notify parent component
      onMessageSent();

      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
        variant: "default"
      });

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const newAttachments: FileAttachment[] = Array.from(files).map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      type: file.type,
      size: file.size,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }));

    setAttachments(prev => [...prev, ...newAttachments]);
  }, []);

  const removeAttachment = (attachmentId: string) => {
    setAttachments(prev => {
      const attachment = prev.find(a => a.id === attachmentId);
      if (attachment?.preview) {
        URL.revokeObjectURL(attachment.preview);
      }
      return prev.filter(a => a.id !== attachmentId);
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const canSend = message.trim().length > 0 || attachments.length > 0;

  return (
    <div className="space-y-3">
      {/* Reply preview */}
      {replyToMessage && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Reply className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-800">
                  Replying to <span className="font-medium">{replyToMessage.senderName}</span>
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancelReply}
                className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-blue-700 mt-1 truncate">
              {replyToMessage.content}
            </p>
          </CardContent>
        </Card>
      )}

      {/* File attachments preview */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <Card key={attachment.id} className="bg-gray-50">
              <CardContent className="p-3">
                <div className="flex items-center space-x-3">
                  {attachment.preview ? (
                    <img
                      src={attachment.preview}
                      alt={attachment.file.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                      {attachment.type.startsWith('image/') ? (
                        <ImageIcon className="w-6 h-6 text-gray-500" />
                      ) : (
                        <FileText className="w-6 h-6 text-gray-500" />
                      )}
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {attachment.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(attachment.size)}
                    </p>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttachment(attachment.id)}
                    className="h-6 w-6 p-0 text-gray-500 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Message input */}
      <div className="flex items-end space-x-2">
        <div className="flex-1 space-y-2">
          <Textarea
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="min-h-[80px] resize-none"
            disabled={isSending}
          />
          
          {/* Attachment buttons */}
          <div className="flex items-center space-x-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.zip,.rar"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
            <input
              ref={imageInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => imageInputRef.current?.click()}
              disabled={isSending}
              className="h-8 px-2"
            >
              <ImageIcon className="w-4 h-4 mr-1" />
              Image
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSending}
              className="h-8 px-2"
            >
              <Paperclip className="w-4 h-4 mr-1" />
              File
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              disabled={isSending}
              className="h-8 px-2"
            >
              <Smile className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <Button
          onClick={handleSendMessage}
          disabled={!canSend || isSending}
          className="h-12 px-6"
        >
          {isSending ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
