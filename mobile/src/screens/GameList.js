import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
  Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants/theme';
import { buildPhotoUrl, fetchGames, fetchTags, fetchTagsByGame } from '../services/api';
import { useSelector } from "react-redux";
import { TRANSLATIONS } from '../constants/translations';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

export default function GameList() {
  const navigation = useNavigation();
  const { user, language } = useSelector((state) => state.auth);
  const t = TRANSLATIONS[language || 'fr'];
  
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchText, setSearchText] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  
  const [availableTags, setAvailableTags] = useState([]);
  const [availablePlatforms, setAvailablePlatforms] = useState([]);
  
  const [showPlatformsModal, setShowPlatformsModal] = useState(false);
  const [showTagsModal, setShowTagsModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    applyFilters();
  }, [searchText, selectedTags, selectedPlatforms, games]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [gamesData, tagsData] = await Promise.all([
        fetchGames(),
        fetchTags()
      ]);

      // Fetch tags for all games and wait for all promises to complete
      await Promise.all(
        gamesData.map(async (game) => {
          game.tags = await fetchTagsByGame(game.id);
        })
      );
      
      // Filter out unapproved games (unless user is admin)
      const approvedGames = user?.is_admin 
        ? gamesData 
        : gamesData.filter(game => game.is_approved === true);
      
      const platformsSet = new Set();
      approvedGames.forEach(game => {
        if (game.platforms) {
          game.platforms.split(',').forEach(platform => {
            platformsSet.add(platform.trim());
          });
        }
      });
      
      setAvailablePlatforms(Array.from(platformsSet).sort());
      setAvailableTags(tagsData.map(tag => tag.name).sort());
      setGames(approvedGames);
      setLoading(false);
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert(t.error, t.unableToLoadGames);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...games];

    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(game =>
        game.name.toLowerCase().includes(search) ||
        game.studio?.toLowerCase().includes(search) ||
        game.publisher?.toLowerCase().includes(search)
      );
    }

    if (selectedPlatforms.length > 0) {
      filtered = filtered.filter(game => {
        if (!game.platforms) return false;
        const gamePlatforms = game.platforms.split(',').map(p => p.trim());
        return selectedPlatforms.every(platform => gamePlatforms.includes(platform));
      });
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter(game => {
        if (!game.tags || game.tags.length === 0) return false;
        const gameTagNames = game.tags.map(t => t.tag_name);
        return selectedTags.every(tag => gameTagNames.includes(tag));
      });
    }

    setFilteredGames(filtered);
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const togglePlatform = (platform) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    );
  };

  const clearFilters = () => {
    setSelectedTags([]);
    setSelectedPlatforms([]);
    setSearchText('');
  };

  const renderGameCard = ({ item }) => {
    const gridUrl = buildPhotoUrl(item.grid_id);
    
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('GameDetails', { gameId: item.id })}
      >
        <View style={styles.imageContainer}>
          {gridUrl ? (
            <Image source={{ uri: gridUrl }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={[styles.image, styles.placeholder]}>
              <MaterialIcons name="videogame-asset" size={40} color={COLORS.formLabel} />
            </View>
          )}
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
          {item.studio && (
            <Text style={styles.studio} numberOfLines={1}>{item.studio}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.button} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.library}</Text>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color={COLORS.formLabel} />
          <TextInput
            style={styles.searchInput}
            placeholder={t.searchGames}
            placeholderTextColor={COLORS.formLabel}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <MaterialIcons name="close" size={20} color={COLORS.formLabel} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.filterBar}>
        <Text style={styles.filterLabel}>{t.sortBy}</Text>
        
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setShowPlatformsModal(true)}
        >
          <Text style={styles.filterBtnText}>{t.platforms}</Text>
          {selectedPlatforms.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{selectedPlatforms.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setShowTagsModal(true)}
        >
          <Text style={styles.filterBtnText}>{t.tags}</Text>
          {selectedTags.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{selectedTags.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {(selectedTags.length > 0 || selectedPlatforms.length > 0) && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.activeFilters}>
          {[...selectedPlatforms, ...selectedTags].map(filter => (
            <View key={filter} style={styles.chip}>
              <Text style={styles.chipText}>{filter}</Text>
              <TouchableOpacity onPress={() => {
                if (selectedPlatforms.includes(filter)) togglePlatform(filter);
                if (selectedTags.includes(filter)) toggleTag(filter);
              }}>
                <MaterialIcons name="close" size={14} color={COLORS.text} />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity onPress={clearFilters} style={styles.clearBtn}>
            <Text style={styles.clearText}>{t.clearAll}</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      <FlatList
        data={filteredGames}
        renderItem={renderGameCard}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.grid}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialIcons name="videogame-asset-off" size={48} color={COLORS.formLabel} />
            <Text style={styles.emptyText}>{t.noGamesFound}</Text>
          </View>
        }
      />

      {/* Platforms Modal */}
      <Modal
        visible={showPlatformsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPlatformsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.platforms}</Text>
              <TouchableOpacity onPress={() => setShowPlatformsModal(false)}>
                <MaterialIcons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              {availablePlatforms.map(platform => (
                <TouchableOpacity
                  key={platform}
                  style={[styles.option, selectedPlatforms.includes(platform) && styles.optionActive]}
                  onPress={() => togglePlatform(platform)}
                >
                  <Text style={styles.optionText}>{platform}</Text>
                  {selectedPlatforms.includes(platform) && (
                    <MaterialIcons name="check" size={20} color={COLORS.button} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.doneBtn} onPress={() => setShowPlatformsModal(false)}>
              <Text style={styles.doneBtnText}>{t.done}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Tags Modal */}
      <Modal
        visible={showTagsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTagsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.tags}</Text>
              <TouchableOpacity onPress={() => setShowTagsModal(false)}>
                <MaterialIcons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              {availableTags.map(tag => (
                <TouchableOpacity
                  key={tag}
                  style={[styles.option, selectedTags.includes(tag) && styles.optionActive]}
                  onPress={() => toggleTag(tag)}
                >
                  <Text style={styles.optionText}>{tag}</Text>
                  {selectedTags.includes(tag) && (
                    <MaterialIcons name="check" size={20} color={COLORS.button} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.doneBtn} onPress={() => setShowTagsModal(false)}>
              <Text style={styles.doneBtnText}>{t.done}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {user && (
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddGame', { availablePlatforms })}>
          <MaterialIcons name="add" size={30} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: COLORS.darkerBackground,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.darkerBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.formLabel,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  filterBtnText: {
    color: COLORS.button,
    fontSize: 14,
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
  activeFilters: {
    backgroundColor: COLORS.darkerBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 20,
    paddingVertical: 12,
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
  clearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  clearText: {
    color: COLORS.formLabel,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  grid: {
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 20,
  },
  card: {
    width: CARD_WIDTH,
    marginHorizontal: 5,
    marginBottom: 20,
    backgroundColor: COLORS.card,
    borderRadius: 8,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH * 1.4,
    backgroundColor: COLORS.darkerBackground,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  studio: {
    fontSize: 12,
    color: COLORS.formLabel,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.text,
  },
  modalOverlay: {
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  modalContent: {
    padding: 20,
  },
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
  }
});