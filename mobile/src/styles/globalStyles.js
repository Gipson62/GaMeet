import { StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../constants/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

export const globalStyles = StyleSheet.create({
  // Container Styles
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    padding: 16,
  },
  
  // Text Styles
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.formLabel,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  formLabel: {
    color: COLORS.formLabel,
    marginBottom: 8,
    marginTop: 12,
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  description: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
    marginTop: 8,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.text,
  },
  
  // Input Styles
  input: {
    backgroundColor: COLORS.card,
    color: COLORS.text,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  
  // Button Styles
  button: {
    backgroundColor: COLORS.button,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  submitBtn: {
    backgroundColor: COLORS.button,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  closeBtn: {
    backgroundColor: COLORS.button,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  closeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  doneBtn: {
    margin: 20,
    padding: 14,
    borderRadius: 8,
    backgroundColor: COLORS.button,
    alignItems: 'center',
  },
  doneBtnText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: COLORS.button,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  
  // Card Styles
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  gameCard: {
    width: CARD_WIDTH,
    marginHorizontal: 5,
    marginBottom: 20,
    backgroundColor: COLORS.card,
    borderRadius: 8,
    overflow: 'hidden',
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  
  // Section Styles
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  
  // Image Styles
  image: {
    width: '100%',
    height: '100%',
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH * 1.4,
    backgroundColor: COLORS.darkerBackground,
  },
  imagePickerBtn: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    height: 150,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: COLORS.formLabel,
    marginTop: 8,
  },
  banner: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  bannerPlaceholder: {
    backgroundColor: COLORS.darkerBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  gridImage: {
    width: 90,
    height: 120,
    borderRadius: 8,
    backgroundColor: COLORS.card,
    marginLeft: 16,
  },
  
  // Header Styles
  headerContainer: {
    width: '100%',
    position: 'relative',
    aspectRatio: 16 / 9,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'transparent',
    backgroundImage: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.9))',
  },
  
  // Tag/Chip Styles
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tagAccent: {
    backgroundColor: COLORS.button,
    borderColor: COLORS.button,
  },
  tagText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '600',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.button,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    gap: 6,
  },
  chipText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: COLORS.button,
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: '700',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalOverlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalContent: {
    backgroundColor: COLORS.darkerBackground,
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  
  // List/Grid Styles
  grid: {
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 20,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  
  // Filter Styles
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.darkerBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  filterBtnText: {
    color: COLORS.button,
    fontSize: 14,
    fontWeight: '600',
  },
  activeFilters: {
    backgroundColor: COLORS.darkerBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  clearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  clearText: {
    color: COLORS.formLabel,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  
  // Option Styles (for modals)
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  optionActive: {
    backgroundColor: COLORS.card,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.text,
  },
  platformItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  platformText: {
    color: COLORS.text,
    fontSize: 16,
  },
  selectedPlatformText: {
    color: COLORS.button,
    fontWeight: 'bold',
  },
});

// Export dimension constants for components that need them
export const DIMENSIONS = {
  CARD_WIDTH,
  screenWidth: width,
};
