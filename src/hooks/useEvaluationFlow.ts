import { useReducer, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useEventDetailQueries } from "@/hooks/useEventDetailQueries";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getJARAttributes } from "@/services/supabase/jarAttributes";
import { useSubmitEvaluation } from "@/hooks/useEvaluations";
import { getCompletedEvaluations } from "@/services/supabase/evaluations";
import { getNextSample as getNextSampleSupabase } from "@/services/supabase/randomization";
import { HedonicScale, JARRating, Sample, ProductType } from "@/types";

// Enhanced State Management with useReducer
interface EvaluationFlowState {
  // Core state
  isInitialized: boolean;
  isTransitioning: boolean;
  isSubmitting: boolean;
  showSampleReveal: boolean;
  forceFormReset: boolean;
  
  // Data state
  currentSample: Sample | null;
  currentProductType: ProductType | null;
  completedSamples: string[];
  optimisticSamples: string[];
  
  // Error state
  error: string | null;
  
  // Debug state
  lastSubmissionId: string | null;
  debugLog: string[];
}

type EvaluationFlowAction =
  | { type: 'INITIALIZE_START' }
  | { type: 'INITIALIZE_SUCCESS'; payload: { currentSample: Sample | null; currentProductType: ProductType | null; completedSamples: string[] } }
  | { type: 'INITIALIZE_ERROR'; payload: string }
  | { type: 'SUBMIT_START'; payload: { sampleId: string } }
  | { type: 'SUBMIT_SUCCESS'; payload: { nextSample: Sample | null; nextProductType: ProductType | null; showReveal: boolean } }
  | { type: 'SUBMIT_ERROR'; payload: string }
  | { type: 'TRANSITION_START' }
  | { type: 'TRANSITION_END' }
  | { type: 'REVEAL_CONTINUE' }
  | { type: 'FORCE_FORM_RESET' }
  | { type: 'CLEAR_OPTIMISTIC' }
  | { type: 'ADD_DEBUG_LOG'; payload: string }
  | { type: 'RESET_STATE' };

const initialState: EvaluationFlowState = {
  isInitialized: false,
  isTransitioning: false,
  isSubmitting: false,
  showSampleReveal: false,
  forceFormReset: false,
  currentSample: null,
  currentProductType: null,
  completedSamples: [],
  optimisticSamples: [],
  error: null,
  lastSubmissionId: null,
  debugLog: []
};

function evaluationFlowReducer(state: EvaluationFlowState, action: EvaluationFlowAction): EvaluationFlowState {
  const newState = (() => {
    switch (action.type) {
      case 'INITIALIZE_START':
        return {
          ...state,
          isTransitioning: true,
          error: null,
          debugLog: [...state.debugLog, `[${new Date().toISOString()}] INITIALIZE_START`]
        };

      case 'INITIALIZE_SUCCESS':
        return {
          ...state,
          isInitialized: true,
          isTransitioning: false,
          currentSample: action.payload.currentSample,
          currentProductType: action.payload.currentProductType,
          completedSamples: action.payload.completedSamples,
          optimisticSamples: [], // Clear any old optimistic updates
          error: null,
          debugLog: [...state.debugLog, `[${new Date().toISOString()}] INITIALIZE_SUCCESS: sample=${action.payload.currentSample?.id}, productType=${action.payload.currentProductType?.id}, completed=${action.payload.completedSamples.length}`]
        };

      case 'INITIALIZE_ERROR':
        return {
          ...state,
          isTransitioning: false,
          error: action.payload,
          debugLog: [...state.debugLog, `[${new Date().toISOString()}] INITIALIZE_ERROR: ${action.payload}`]
        };

      case 'SUBMIT_START':
        return {
          ...state,
          isSubmitting: true,
          optimisticSamples: [...state.optimisticSamples, action.payload.sampleId], // Add optimistic update
          lastSubmissionId: action.payload.sampleId,
          error: null,
          debugLog: [...state.debugLog, `[${new Date().toISOString()}] SUBMIT_START: sampleId=${action.payload.sampleId}, optimistic=[${[...state.optimisticSamples, action.payload.sampleId].join(',')}]`]
        };

      case 'SUBMIT_SUCCESS':
        return {
          ...state,
          isSubmitting: false,
          isTransitioning: false,
          currentSample: action.payload.nextSample,
          currentProductType: action.payload.nextProductType,
          showSampleReveal: action.payload.showReveal,
          forceFormReset: true, // Force form reset after successful submission
          debugLog: [...state.debugLog, `[${new Date().toISOString()}] SUBMIT_SUCCESS: nextSample=${action.payload.nextSample?.id}, showReveal=${action.payload.showReveal}`]
        };

      case 'SUBMIT_ERROR':
        return {
          ...state,
          isSubmitting: false,
          optimisticSamples: state.optimisticSamples.filter(id => id !== state.lastSubmissionId), // Rollback optimistic update
          error: action.payload,
          debugLog: [...state.debugLog, `[${new Date().toISOString()}] SUBMIT_ERROR: ${action.payload}, rolled back optimistic update`]
        };

      case 'TRANSITION_START':
        return {
          ...state,
          isTransitioning: true,
          debugLog: [...state.debugLog, `[${new Date().toISOString()}] TRANSITION_START`]
        };

      case 'TRANSITION_END':
        return {
          ...state,
          isTransitioning: false,
          debugLog: [...state.debugLog, `[${new Date().toISOString()}] TRANSITION_END`]
        };

      case 'REVEAL_CONTINUE':
        return {
          ...state,
          showSampleReveal: false,
          debugLog: [...state.debugLog, `[${new Date().toISOString()}] REVEAL_CONTINUE`]
        };

      case 'FORCE_FORM_RESET':
        return {
          ...state,
          forceFormReset: true,
          debugLog: [...state.debugLog, `[${new Date().toISOString()}] FORCE_FORM_RESET`]
        };

      case 'CLEAR_OPTIMISTIC':
        return {
          ...state,
          optimisticSamples: [],
          forceFormReset: false, // Reset form reset flag
          debugLog: [...state.debugLog, `[${new Date().toISOString()}] CLEAR_OPTIMISTIC: cleared optimistic updates`]
        };

      case 'ADD_DEBUG_LOG':
        return {
          ...state,
          debugLog: [...state.debugLog, `[${new Date().toISOString()}] ${action.payload}`]
        };

      case 'RESET_STATE':
        return {
          ...initialState,
          debugLog: [...state.debugLog, `[${new Date().toISOString()}] RESET_STATE: complete state reset`]
        };

      default:
        return state;
    }
  })();

  // Log state changes for debugging
  console.log('🔄 EvaluationFlow State Change:', {
    action: action.type,
    prevState: state,
    newState,
    debugLog: newState.debugLog.slice(-5) // Show last 5 debug entries
  });

  return newState;
}

export function useEvaluationFlow(eventId?: string) {
  const [state, dispatch] = useReducer(evaluationFlowReducer, initialState);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const initInProgress = useRef(false);

  // Data queries
  const { event, productTypes } = useEventDetailQueries(eventId);
  
  const { data: jarAttributes = [] } = useQuery({
    queryKey: ['jarAttributes', eventId],
    queryFn: () => getJARAttributes(eventId!),
    enabled: !!eventId,
  });

  const { data: serverCompletedSamples = [] } = useQuery({
    queryKey: ['completedEvaluations', eventId, user?.id],
    queryFn: () => getCompletedEvaluations(eventId!, user!.id),
    enabled: !!eventId && !!user?.id,
  });

  const submitEvaluationMutation = useSubmitEvaluation();

  // Merge server and optimistic completed samples
  const allCompletedSamples = [
    ...serverCompletedSamples.map(e => e.sampleId),
    ...state.optimisticSamples
  ];

  // BULLETPROOF INITIALIZATION WITH TIMEOUT AND FALLBACKS
  const initializeEvaluation = useCallback(async () => {
    if (!eventId || !user?.id || initInProgress.current) {
      console.log('🔍 Initialize skipped:', { eventId: !!eventId, userId: !!user?.id, inProgress: initInProgress.current });
      return;
    }

    initInProgress.current = true;
    const startTime = Date.now();
    dispatch({ type: 'INITIALIZE_START' });
    
    console.log('🚀 BULLETPROOF INITIALIZATION START:', { 
      eventId, 
      userId: user.id, 
      evaluatorPosition: user.evaluatorPosition,
      evaluatorPositionType: typeof user.evaluatorPosition,
      timestamp: new Date().toISOString()
    });

    try {
      // TIMEOUT MECHANISM: Max 10 seconds for entire initialization
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Initialization timeout - exceeded 10 seconds')), 10000);
      });

      const initPromise = async () => {
        // Checkpoint 1: Validate inputs
        console.log('✅ CHECKPOINT 1: Input validation');
        if (!user.evaluatorPosition && user.evaluatorPosition !== 0) {
          throw new Error(`Invalid evaluator position: ${user.evaluatorPosition} (type: ${typeof user.evaluatorPosition})`);
        }

        // Checkpoint 2: Get completed evaluations
        console.log('✅ CHECKPOINT 2: Fetching completed evaluations...');
        const stepStartTime = Date.now();
        const completedEvaluations = await getCompletedEvaluations(eventId, user.id);
        const completedSampleIds = completedEvaluations.map(e => e.sampleId);
        console.log(`✅ CHECKPOINT 2 COMPLETE: ${Date.now() - stepStartTime}ms, samples:`, completedSampleIds);

        // Checkpoint 3: Validate product types
        console.log('✅ CHECKPOINT 3: Validating product types...');
        if (!productTypes || productTypes.length === 0) {
          throw new Error('No product types available for this event');
        }
        console.log(`✅ CHECKPOINT 3 COMPLETE: ${productTypes.length} product types available`);

        // Checkpoint 4: Get next sample with explicit position conversion
        console.log('✅ CHECKPOINT 4: Getting next sample...');
        const evaluatorPositionStr = String(user.evaluatorPosition);
        console.log('🔍 CRITICAL PARAMS:', {
          userId: user.id,
          eventId,
          evaluatorPosition: evaluatorPositionStr,
          completedSampleIds,
          evaluatorPositionOriginal: user.evaluatorPosition
        });

        const stepStartTime4 = Date.now();
        const nextSampleData = await getNextSampleSupabase(
          user.id, 
          eventId, 
          evaluatorPositionStr, 
          completedSampleIds
        );
        console.log(`✅ CHECKPOINT 4 COMPLETE: ${Date.now() - stepStartTime4}ms, result:`, nextSampleData);
        
        const nextSample = nextSampleData?.sample || null;
        console.log('🎪 Next sample analysis:', {
          hasNextSample: !!nextSample,
          sampleId: nextSample?.id,
          isComplete: nextSampleData?.isComplete,
          nextSampleData
        });
        
        // Checkpoint 5: Find product type
        console.log('✅ CHECKPOINT 5: Finding product type...');
        const currentProductType = nextSample && productTypes 
          ? productTypes.find(pt => pt.id === nextSample.productTypeId) || null
          : null;
        console.log('✅ CHECKPOINT 5 COMPLETE:', {
          productTypeId: currentProductType?.id,
          productTypeName: currentProductType?.productName,
          nextSampleProductTypeId: nextSample?.productTypeId
        });

        // Final checkpoint: Log complete state
        const totalTime = Date.now() - startTime;
        console.log('🎯 BULLETPROOF INITIALIZATION COMPLETE:', {
          totalTimeMs: totalTime,
          hasNextSample: !!nextSample,
          sampleId: nextSample?.id,
          productTypeId: currentProductType?.id,
          productTypeName: currentProductType?.productName,
          completedCount: completedSampleIds.length,
          availableProductTypes: productTypes?.length || 0,
          isComplete: nextSampleData?.isComplete,
          timestamp: new Date().toISOString()
        });

        return {
          currentSample: nextSample,
          currentProductType,
          completedSamples: completedSampleIds
        };
      };

      // Race between initialization and timeout
      const result = await Promise.race([initPromise(), timeoutPromise]);

      dispatch({ 
        type: 'INITIALIZE_SUCCESS', 
        payload: result
      });

    } catch (error) {
      const totalTime = Date.now() - startTime;
      console.error('🚨 BULLETPROOF INITIALIZATION FAILED:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        totalTimeMs: totalTime,
        userContext: {
          userId: user.id,
          evaluatorPosition: user.evaluatorPosition,
          evaluatorPositionType: typeof user.evaluatorPosition
        },
        eventContext: {
          eventId,
          productTypesCount: productTypes?.length || 0
        },
        timestamp: new Date().toISOString()
      });

      const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';
      dispatch({ 
        type: 'INITIALIZE_ERROR', 
        payload: `Init failed (${totalTime}ms): ${errorMessage}` 
      });
    } finally {
      initInProgress.current = false;
    }
  }, [eventId, user?.id, user?.evaluatorPosition, queryClient, productTypes]);

  const submitEvaluation = useCallback(async (data: { hedonic: HedonicScale; jar: JARRating }) => {
    if (!state.currentSample || !user?.id || !eventId) {
      dispatch({ type: 'ADD_DEBUG_LOG', payload: 'Submit failed: missing required data' });
      return;
    }

    const sampleId = state.currentSample.id;
    dispatch({ type: 'SUBMIT_START', payload: { sampleId } });
    dispatch({ type: 'TRANSITION_START' });

    try {
      // Submit to server
      await submitEvaluationMutation.mutateAsync({
        userId: user.id,
        sampleId: sampleId,
        productTypeId: state.currentSample.productTypeId,
        eventId: eventId,
        hedonicRatings: data.hedonic,
        jarRatings: data.jar,
      });

      dispatch({ type: 'ADD_DEBUG_LOG', payload: `Server submission successful for sample ${sampleId}` });

      // CRITICAL: Proper data flow sequence
      // 1. Refetch completed evaluations from server
      await queryClient.invalidateQueries({ queryKey: ['completedEvaluations', eventId, user.id] });
      await queryClient.refetchQueries({ queryKey: ['completedEvaluations', eventId, user.id] });

      // 2. Get updated completed samples (including the one we just submitted)
      const updatedCompletedSamples = queryClient.getQueryData(['completedEvaluations', eventId, user.id]) as any[] || [];
      const updatedCompletedSampleIds = updatedCompletedSamples.map(e => e.sampleId);

      dispatch({ type: 'ADD_DEBUG_LOG', payload: `Updated completed samples after server sync: [${updatedCompletedSampleIds.join(',')}]` });

      // 3. Clear optimistic updates now that server is synced
      dispatch({ type: 'CLEAR_OPTIMISTIC' });

      // 4. Get next sample based on updated completed list
      const nextSampleData = await getNextSampleSupabase(user.id, eventId, user.evaluatorPosition?.toString(), updatedCompletedSampleIds);
      const nextSample = nextSampleData?.sample || null;
      const nextProductType = nextSample 
        ? productTypes?.find(pt => pt.id === nextSample.productTypeId) || null
        : null;

      // 5. Determine if we should show sample reveal
      const currentProductTypeId = state.currentSample.productTypeId;
      const shouldShowReveal = !nextSample || (nextSample && nextSample.productTypeId !== currentProductTypeId);

      dispatch({ type: 'ADD_DEBUG_LOG', payload: `Next sample: ${nextSample?.id}, nextProductType: ${nextProductType?.id}, showReveal: ${shouldShowReveal}` });

      // 6. Update state with results
      dispatch({
        type: 'SUBMIT_SUCCESS',
        payload: {
          nextSample,
          nextProductType,
          showReveal: shouldShowReveal
        }
      });

    } catch (error) {
      console.error('🚨 Submit error:', error);
      dispatch({ type: 'SUBMIT_ERROR', payload: error instanceof Error ? error.message : 'Submit failed' });
    }
  }, [state.currentSample, user?.id, user?.evaluatorPosition, eventId, submitEvaluationMutation, queryClient, productTypes]);

  const continueAfterReveal = useCallback(async () => {
    dispatch({ type: 'REVEAL_CONTINUE' });
    dispatch({ type: 'TRANSITION_START' });
    
    try {
      // Re-initialize to get the next sample
      await initializeEvaluation();
    } finally {
      dispatch({ type: 'TRANSITION_END' });
    }
  }, [initializeEvaluation]);

  // Derived state
  const isEvaluationCompleteForUser = !state.currentSample && state.isInitialized && !state.isTransitioning;
  const isLoading = !state.isInitialized || state.isTransitioning;
  
  const canEnterEvaluation = useCallback(() => {
    return !!event && !!user?.evaluatorPosition;
  }, [event, user?.evaluatorPosition]);

  // Debug logging to console
  if (state.debugLog.length > 0) {
    console.log('🔍 EvaluationFlow Debug Log:', state.debugLog.slice(-10));
  }

  return {
    // State
    isLoading,
    isEvaluationCompleteForUser,
    showSampleReveal: state.showSampleReveal,
    currentProductType: state.currentProductType,
    isTransitioning: state.isTransitioning,
    currentSample: state.currentSample,
    forceFormReset: state.forceFormReset,
    isSubmitting: state.isSubmitting,
    error: state.error,
    
    // Data
    jarAttributes,
    completedSamples: allCompletedSamples,
    
    // Actions
    initializeEvaluation,
    submitEvaluation,
    continueAfterReveal,
    canEnterEvaluation,
    
    // Debug
    debugLog: state.debugLog,
    dispatch // For debugging purposes
  };
}