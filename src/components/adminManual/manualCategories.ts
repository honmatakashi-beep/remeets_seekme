import {
  ShieldCheck, AlertTriangle, Users, Settings, Database, Activity,
  Sliders, Shield, Lock, Eye, Download, BookOpen, Key, Bell, HelpCircle
} from "lucide-react";

import React, { useState, useMemo, useRef } from 'react';
import {
  BookOpen,
  Shield,
  Activity,
  Settings,
  Users,
  Mail,
  Sparkles,
  Bot,
  AlertTriangle,
  Trash2,
  Bell,
  UserCheck,
  ShieldAlert,
  Terminal,
  FileSpreadsheet,
  CheckSquare,
  Coins,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  UserPlus,
  Brain,
  BarChart3,
  HelpCircle,
  Key,
  RefreshCw,
  Layers,
  Download,
  Database,
  Server,
  Lock,
  Printer,
  Copy,
  Check,
  Search,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Award,
  CreditCard,
  History,
  Palette,
  Sliders,
  FileText,
  Menu,
  X,
  ArrowLeft,
  ArrowRight,
  Info,
  SlidersHorizontal,
  Code,
  FileCode,
  AlertCircle
} from 'lucide-react';

interface ManualCategory {
  id: string;
  categoryTitle: string;
  icon: any;
  sections: {
    id: string;
    title: string;
    description: string;
    badge?: string;
  }[];
}

