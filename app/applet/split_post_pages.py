import os
import re

with open('src/pages/PostPages.tsx', 'r', encoding='utf-8') as f:
    orig_content = f.read()

# If PostPages was already modified to re-export, restore or check git show HEAD:src/pages/PostPages.tsx
import subprocess
git_show = subprocess.run(['git', 'show', 'HEAD:src/pages/PostPages.tsx'], capture_output=True, text=True)
if git_show.returncode == 0 and len(git_show.stdout) > 1000:
    lines = git_show.stdout.splitlines(keepends=True)
else:
    lines = orig_content.splitlines(keepends=True)

# Common headers (lines 1 to 31)
header_lines = lines[:31]
header_text = "".join(header_lines)

# Fix relative import paths for files in src/pages/posts/
def fix_imports(text):
    text = text.replace("from '../contexts/", "from '../../contexts/")
    text = text.replace("from '../lib/", "from '../../lib/")
    text = text.replace("from '../components/", "from '../../components/")
    text = text.replace("from '../assets/", "from '../../assets/")
    text = text.replace("from './AuthPages'", "from '../AuthPages'")
    text = text.replace("from './SearchPage'", "from '../SearchPage'")
    return text

fixed_header_text = fix_imports(header_text)

edit_post_page_code = fix_imports("".join(lines[31:1096]))
create_post_page_code = fix_imports("".join(lines[1096:3251]))
post_utils_code = "".join(lines[3251:3394])
post_modals_part1_code = fix_imports("".join(lines[3394:5069]))
post_detail_page_code = fix_imports("".join(lines[5069:7775]))
report_modal_code = fix_imports("".join(lines[7775:]))

post_modals_code = post_modals_part1_code + "\n\n" + report_modal_code

os.makedirs('src/pages/posts', exist_ok=True)

# 1. src/pages/posts/PostUtils.tsx
with open('src/pages/posts/PostUtils.tsx', 'w', encoding='utf-8') as f:
    f.write("""import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronUp, ArrowUp } from 'lucide-react';
import { cn } from '../../lib/utils';

""" + post_utils_code)

# 2. src/pages/posts/PostModals.tsx
with open('src/pages/posts/PostModals.tsx', 'w', encoding='utf-8') as f:
    f.write(fixed_header_text + """
import { ScrollToTop, ScrollToTopButton } from './PostUtils';

""" + post_modals_code)

# 3. src/pages/posts/EditPostPage.tsx
with open('src/pages/posts/EditPostPage.tsx', 'w', encoding='utf-8') as f:
    f.write(fixed_header_text + """
import { ScrollToTop, ScrollToTopButton } from './PostUtils';
import { SeoPreviewModal, FlowExplanation, RecipientSafetyGuide, RevealContactModal, SuccessModal, AgeVerificationGate, ComplianceBanner, ReportModal } from './PostModals';

""" + edit_post_page_code)

# 4. src/pages/posts/CreatePostPage.tsx
with open('src/pages/posts/CreatePostPage.tsx', 'w', encoding='utf-8') as f:
    f.write(fixed_header_text + """
import { ScrollToTop, ScrollToTopButton } from './PostUtils';
import { SeoPreviewModal, FlowExplanation, RecipientSafetyGuide, RevealContactModal, SuccessModal, AgeVerificationGate, ComplianceBanner, ReportModal } from './PostModals';

""" + create_post_page_code)

# 5. src/pages/posts/PostDetailPage.tsx
with open('src/pages/posts/PostDetailPage.tsx', 'w', encoding='utf-8') as f:
    f.write(fixed_header_text + """
import { ScrollToTop, ScrollToTopButton } from './PostUtils';
import { SeoPreviewModal, FlowExplanation, RecipientSafetyGuide, RevealContactModal, SuccessModal, AgeVerificationGate, ComplianceBanner, ReportModal } from './PostModals';

""" + post_detail_page_code)

# 6. src/pages/posts/index.ts
with open('src/pages/posts/index.ts', 'w', encoding='utf-8') as f:
    f.write("""export * from './PostUtils';
export * from './PostModals';
export * from './EditPostPage';
export * from './CreatePostPage';
export * from './PostDetailPage';
""")

# 7. src/pages/PostPages.tsx (Re-export for backwards compatibility)
with open('src/pages/PostPages.tsx', 'w', encoding='utf-8') as f:
    f.write("""/**
 * ReMEETs PostPages Entrypoint (Re-exports from src/pages/posts/*)
 * This maintains full backward compatibility with existing imports.
 */
export * from './posts';
""")

print("Successfully regenerated src/pages/posts/* with accurate import paths")
