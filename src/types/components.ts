/**
 * Component Props Type Definitions
 */

import { ReactNode, RefObject } from 'react';
import { Card, Deck, ButtonVariant, ButtonSize, SpinnerSize, ToastType } from './models';

// Button Props
export interface ButtonProps {
  children: ReactNode;
  onClick: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  title?: string;
}

// Loading Spinner Props
export interface LoadingSpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

// Toast Props
export interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

// Modal Props
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

// Confirm Dialog Props
export interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

// Card List Item Props
export interface CardListItemProps {
  card: Card;
  showBack?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

// Card Side Input Props
export interface CardSideInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onPaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => Promise<void> | void;
  placeholder: string;
  imageUrl: string;
  onImageClick: () => void;
  onAIImageClick?: () => void;
  textareaRef?: RefObject<HTMLTextAreaElement>;
  side: 'front' | 'back';
}

// Flash Card Props
export interface FlashCardProps {
  card: Card;
  isFlipped: boolean;
  onFlip: () => void;
}

// Image Preview Props
export interface ImagePreviewProps {
  imageUrl: string;
  onRemove: () => void;
  alt: string;
}

// Inline Card Editor Props
export interface InlineCardEditorProps {
  deckId: string;
  onSave?: () => void;
  onCancel?: () => void;
  card?: Card | null;
  autoFocus?: boolean;
}

// Inline Deck Editor Props
export interface InlineDeckEditorProps {
  deck?: Deck | null;
  onSave?: () => void;
  onCancel?: () => void;
  autoFocus?: boolean;
}

// Deck Card Props
export interface DeckCardProps {
  deck: Deck;
  onClick: () => void;
}

// Deck Detail Props
export interface DeckDetailProps {
  deckId: string;
  onBack?: () => void;
  onStudy: (deckId: string) => void;
  backLabel?: string;
}

// Deck List Props
export interface DeckListProps {
  onSelectDeck: (deckId: string) => void;
}

// Create Deck Modal Props
export interface CreateDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  deck?: Deck | null;
}

// Bulk Add Form Props
export interface BulkAddFormProps {
  isOpen: boolean;
  onClose: () => void;
  deckId: string;
}

// Study Session Props
export interface StudySessionProps {
  deckId: string;
  onExit: () => void;
}

// Rating Buttons Props
export interface RatingButtonsProps {
  onRate: (rating: number) => void;
}

// Session Stats Props
export interface SessionStatsProps {
  stats: {
    cardsReviewed: number;
    timeElapsed: number;
    accuracy: number;
  };
}

// Dashboard Props
export interface DashboardProps {
  onSelectDeck: (deckId: string) => void;
  onStudyAll?: () => void;
  onCreateDeck?: () => void;
  onNavigate: (view: string) => void;
  onStudy: (deckId: string) => void;
}

// Decks View Props
export interface DecksViewProps {
  onSelectDeck: (deckId: string) => void;
  onCreateDeck?: () => void;
}

// App Header Props
export interface AppHeaderProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  backButton?: ReactNode;
  actions?: ReactNode;
}

// Top Nav Props
export interface TopNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onCreateDeck?: () => void;
}

// Breadcrumb Item
export interface BreadcrumbItem {
  label: string;
  icon?: string;
  onClick?: () => void;
}

// Breadcrumbs Props
export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

// Empty State Props
export interface EmptyStateProps {
  icon?: string;
  headline: string;
  body?: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    variant?: ButtonVariant;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: ButtonVariant;
  };
}

// Typography Props
export interface TypographyProps {
  children: ReactNode;
  className?: string;
}

// Form Input Props
export interface FormInputProps {
  label: string;
  [key: string]: any;
}

// Form Textarea Props
export interface FormTextareaProps {
  label: string;
  [key: string]: any;
}

// Confetti Props
export interface ConfettiProps {
  duration?: number;
}

