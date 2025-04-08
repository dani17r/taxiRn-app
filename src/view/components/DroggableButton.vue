<template>
  <div
    class="draggable-button"
    :style="buttonStyle"
    @mousedown="startDrag"
    @touchstart="startDrag" 
    @click.stop="handleClick"
    ref="draggableBtn"
  >
    <q-btn
      round
      :color="color"
      :icon="icon"
      :size="size"
      class="cursor-move drag-target-visual" 
      unelevated
    >
      <slot></slot>
    </q-btn>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, type Ref } from 'vue'

// --- Props Interface ---
interface DraggableButtonProps {
  initialX?: number
  initialY?: number
  color?: string
  icon?: string
  size?: string
  clickDelay?: number
  offsetTopPx?: number // Prop for top offset in pixels
  offsetBottomPx?: number // New prop for bottom offset in pixels
}

// --- Props Definition ---
const props = withDefaults(defineProps<DraggableButtonProps>(), {
  initialX: 50,
  initialY: 50,
  color: 'primary',
  icon: 'drag_indicator',
  size: 'md',
  clickDelay: 200, // Restored default: ms para distinguir entre drag y click
  offsetTopPx: 0, // Default top offset is 0
  offsetBottomPx: 0, // Default bottom offset is 0
})

// --- Emits ---
const emit = defineEmits<{
  (e: 'click'): void
}>()

// --- Refs ---
const draggableBtn: Ref<HTMLElement | null> = ref(null)
const isDragging = ref(false)
const startX = ref(0)
const startY = ref(0)
const startLeft = ref(props.initialX)
const startTop = ref(props.initialY)
const posX = ref(props.initialX)
const posY = ref(props.initialY)
const dragStartTime = ref(0)

// --- Computed Style ---
import type { CSSProperties } from 'vue';

const buttonStyle = computed((): CSSProperties => ({
  left: `${posX.value}%`,
  top: `${posY.value}%`,
  transform: 'translate(-50%, -50%)', // Center the button on the coordinates
  position: 'fixed' as const, // Explicitly type 'fixed'
  zIndex: 9999, // Ensure it's on top
  touchAction: 'none', // Prevent default touch actions like scrolling
  cursor: 'grab', // Indicate draggable
}));

// --- Event Handlers ---
const getEventCoordinates = (e: MouseEvent | TouchEvent): { x: number; y: number } | null => {
  if (e instanceof MouseEvent) {
    return { x: e.clientX, y: e.clientY };
  }
  // Check touches and length explicitly
  if (e.touches && e.touches.length > 0) {
    const touch = e.touches[0]; // Assign to variable first
    if (touch) { // Extra check for safety (though length > 0 implies it exists)
        return { x: touch.clientX, y: touch.clientY };
    }
  }
  return null;
};

const startDrag = (e: MouseEvent | TouchEvent) => {
  const coords = getEventCoordinates(e)
  if (!coords) return

  isDragging.value = true
  dragStartTime.value = Date.now()
  draggableBtn.value?.style.setProperty('cursor', 'grabbing') // Change cursor

  startX.value = coords.x
  startY.value = coords.y
  startLeft.value = posX.value // Store initial percentage position
  startTop.value = posY.value

  // Prevent default actions like text selection during drag (for mouse)
  // or page scroll (for touch, handled by removing .passive)
  if (e instanceof MouseEvent) {
    e.preventDefault()
  }
  // For touchstart, preventDefault is implicitly needed if we want to stop scroll,
  // hence the removal of .passive modifier in the template.
}

const onDrag = (e: MouseEvent | TouchEvent) => {
  if (!isDragging.value) return

  const coords = getEventCoordinates(e)
  if (!coords) return

  // Prevent scrolling during touch drag
  if (e instanceof TouchEvent) {
      e.preventDefault()
  }

  const deltaX = coords.x - startX.value
  const deltaY = coords.y - startY.value

  // Calculate position change in percentage relative to window size
  const newX = startLeft.value + (deltaX / window.innerWidth) * 100
  const newY = startTop.value + (deltaY / window.innerHeight) * 100

  // Clamp position within 0% and 100%
  posX.value = Math.max(0, Math.min(100, newX))
  // Calculate minimum and maximum top percentages based on offset props
  const minTopPercent = (props.offsetTopPx / window.innerHeight) * 100;
  const maxTopPercent = 100 - (props.offsetBottomPx / window.innerHeight) * 100;

  // Clamp horizontal position within 0% and 100%
  posX.value = Math.max(0, Math.min(100, newX));
  // Clamp vertical position within minTopPercent and maxTopPercent
  posY.value = Math.max(minTopPercent, Math.min(maxTopPercent, newY));
}

const stopDrag = () => {
  if (isDragging.value) {
    isDragging.value = false
    draggableBtn.value?.style.setProperty('cursor', 'grab') // Restore cursor
  }
}

const handleClick = () => {
  // Only emit click if the time between mousedown/touchstart and mouseup/touchend
  // is less than the defined delay (i.e., it wasn't a drag)
  const dragDuration = Date.now() - dragStartTime.value
  if (!isDragging.value || dragDuration < props.clickDelay) {
    // Check !isDragging as well in case stopDrag fired slightly before click
    emit('click')
  }
  // Reset drag start time in case of a click without drag
  dragStartTime.value = 0
}

// --- Lifecycle Hooks for Event Listeners ---
onMounted(() => {
  window.addEventListener('mousemove', onDrag)
  // Use passive: false for touchmove ONLY if preventDefault is called inside onDrag
  // In this case, it is called inside onDrag for TouchEvent
  window.addEventListener('touchmove', onDrag, { passive: false })
  window.addEventListener('mouseup', stopDrag)
  window.addEventListener('touchend', stopDrag)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('touchmove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
  window.removeEventListener('touchend', stopDrag)
})
</script>

<style scoped>
.draggable-button {
  /* transition: transform 0.1s ease; */ /* Can cause slight lag during fast drag */
  will-change: left, top; /* Optimize rendering */
}

/* Apply scaling effect via the inner button if desired, or keep it simple */
/* .draggable-button:active {
  transition: none;
  transform: translate(-50%, -50%) scale(1.1);
} */

/* Ensure the button itself doesn't interfere with drag events */
.drag-target-visual {
  pointer-events: none; /* Make the button visual only for pointer events */
}

/* Removed .no-pointer-events class as it's no longer needed */
</style>
