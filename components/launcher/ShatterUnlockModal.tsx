/**
 * ShatterUnlockModal.tsx
 * Production upgrade modal for the live Launcher route.
 *
 * Primary path: create a server-side upgrade claim, open Stripe Checkout, then
 * poll the claim until the verified webhook fulfills it and the app unlocks.
 * Manual email + license entry is retained only as a restore/recovery path.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { motion, Animate